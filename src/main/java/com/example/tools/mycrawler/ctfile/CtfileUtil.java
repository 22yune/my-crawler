package com.example.tools.mycrawler.ctfile;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.tools.mycrawler.Download;
import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.epubee.IP;
import com.example.tools.mycrawler.library.BookLibrary;
import com.example.tools.mycrawler.tianlang.TianLangCrawlerByJsoup;
import lombok.Builder;
import lombok.Data;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-19
 */
@Slf4j
public class CtfileUtil {
    private static final String storeDir = "/Users/hunliji/books/ct";
    private static final String downDir = "/Users/hunliji/books/ct";
    private static final ExecutorService executorService = Executors.newFixedThreadPool(1);
    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();
    @Setter
    private static BookLibrary bookLibrary = new BookLibrary();

    public static void main(String[] args) throws IOException {

        download("https://u062.com/file/14804066-229509484",null,false,"关键对话");
        TianLangCrawlerByJsoup.downAll(false, -1);
        //FileUtils.writeLines(new File(dir,"files.txt"), FileUtils.listFiles(new File(dir),null,false).stream().map(File::getName).collect(Collectors.toList()));

    }

    public static CompletableFuture<Boolean> submitDownTask(Supplier<String> lanzUrl, String pwd, boolean check, String bookName){
        return CompletableFuture.supplyAsync(() -> download(lanzUrl.get(), pwd, check, bookName), executorService);
    }

    public static boolean download(String cturl, String pwd, boolean check, String bookName){
        try {
            Book book = getBook(cturl, pwd);
            if(book != null){
                String url = book.getUrls().get(0).getUrl();
                String name = book.name + "." + book.getUrls().get(0).getType();
                return Download.download(new Download.BookFile(name,url,downDir), e -> doDown(e.getUrl(),e.getName(),e.getDownDir()),false,bookName,check,storeDir, bookLibrary);
            }
        }catch (Exception ignore){
        }
        return false;
    }

    private static boolean doDown(String url,String name ,String dir){
        Map<String,String> map = HttpUtils.download(url, "", IP.getNewIP(),name, "1", dir);
        boolean r = map != null && map.containsKey("code");
        if(!r){
            File file = new File(dir,name);
            if(file.exists() && !file.delete()){
                log.warn("文件删除失败:{}", file.getName());
            }
        }
        return r;
    }

    private static void save(String path,List<String> vs) {
        try {
            log.info("文件保存" + path );
            FileUtils.writeLines(new File(path), vs);
        } catch (IOException e) {
            log.error("文件保存异常" + path, e);
        }
    }

    public static Book getBook(String url,String pwd){
        return doRetry(3,() -> {
            if (url.contains("/f/")){
                String id = url.substring(url.lastIndexOf("/") + 1,url.lastIndexOf("?") > 0 ? url.lastIndexOf("?") : url.length());
                JSONObject o =  getFilechk("/f/" + id, pwd);
                String name = o.getString("file_name");
                String urld = o.getString("downurl");
                return Book.builder().name(null)
                        .urls(Collections.singletonList(BookUrl.builder().type(name.substring(name.lastIndexOf(".") + 1)).url(urld).build()))
                        .build();
            }
                JSONObject file = getDirInfo(url,pwd);
                String folderName = file.getString("folder_name");
                String dirUrl = file.getString("url");
                JSONArray dir = getDir(dirUrl);
                List<BookUrl> urls = dir.stream().map( e -> {
                    Elements f = Jsoup.parse(((JSONArray)e).getString(1)).select(" a");
                    String tempDir = f.attr("href");
                    String name = f.text();
                    String urld = getFilechk(tempDir,"").getString("downurl");
                    return BookUrl.builder().type(name.substring(name.lastIndexOf(".") + 1)).url(urld).build();
                }).sorted(Comparator.comparing(a -> Type.index(a.getType()))).collect(Collectors.toList());
                return Book.builder().name(folderName).urls(urls).build();
            });
    }

    public static JSONObject getFileInfo(String url, String pwd){
        // String u = "https://webapi.ctfile.com/getfile.php?path=f&f=14804066-605844636-9ff0ef";
        url = url.trim();
        String id = url.substring(url.lastIndexOf("/") + 1,url.lastIndexOf("?") > 0 ? url.lastIndexOf("?") : url.length());
        String rurl = "https://webapi.ctfile.com/getfile.php?path=f&f=" + id + "&passcode=" + pwd;
        return doRetry(3,() -> {
            Document listPage = Jsoup.connect(rurl).get();
            JSONObject object = JSON.parseObject(listPage.body().text());
            return object.getObject("file",JSONObject.class);
        });
    }

    public static JSONObject getDirInfo(String url, String pwd){
       // String u = "https://webapi.ctfile.com/getdir.php?path=d&d=18000254-49360899-bb4ee9&passcode=908047";
        url = url.trim();
        String id = url.substring(url.lastIndexOf("/") + 1,url.lastIndexOf("?") > 0 ? url.lastIndexOf("?") : url.length());
        //url = url.substring(0,url.lastIndexOf("?") > 0 ? url.lastIndexOf("?") : url.length() ).replace("https://url54.ctfile.com/d/","https://webapi.ctfile.com/getdir.php?path=d&d=");
        String rurl = "https://webapi.ctfile.com/getdir.php?path=d&d=" + id + "&passcode=" + pwd;
        return doRetry(3,() -> {
            Document listPage = Jsoup.connect(rurl).get();
            JSONObject object = JSON.parseObject(listPage.body().text());
            return object.getObject("file",JSONObject.class);
        });
    }
    public static JSONArray getDir(String url){
        String rurl = "https://webapi.ctfile.com" + url;
        return doRetry(3,() ->{
            Map<String,String> map = HttpUtils.get(rurl, "");
            String a = map.get("body");
            JSONObject object = JSON.parseObject(a);
            return object.getJSONArray("aaData");
        });
    }
    public static JSONObject getFilechk(String tempDir, String pwd){
        String rurl = "https://webapi.ctfile.com/getfile.php?path=f&f=" + tempDir.replace("/f/","") + "&passcode=" + pwd;;
        return doRetry(3,() ->{
            Map<String,String> map = HttpUtils.get(rurl, "");
            String a = map.get("body");
            JSONObject object = JSON.parseObject(a).getJSONObject("file");
            return getFileDownUrl(object.getString("userid"),object.getString("file_id"),object.getString("file_chk"));
        });
    }

    public static JSONObject getFileDownUrl(String uid, String fid, String fck){
        String rurl = String.format("https://webapi.ctfile.com/get_file_url.php?uid=%s&fid=%s&file_chk=%s",uid,fid,fck);
        return doRetry(3,() ->{
            Map<String,String> map = HttpUtils.get(rurl, "");
            String a = map.get("body");
            JSONObject object = JSON.parseObject(a);
            return object;
        });
    }
    @Data
    @Builder
    public static class Book{
        private String name;
        private List<BookUrl> urls;
    }

    @Data
    @Builder
    public static class BookUrl{
        private String type;
        private String url;
    }

    public enum Type{
        AZW3,MOBI,EPUB,ZIP,PDF,OTHER;
        public static Integer index(String v){
            try{
                return valueOf(v.toUpperCase()).ordinal();
            }catch (Exception e){
                return OTHER.ordinal();
            }
        }
    }
}
