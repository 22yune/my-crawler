package com.example.tools.mycrawler.ctfile;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.epubee.IP;
import com.example.tools.mycrawler.tianlang.TianLangCrawlerByJsoup;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.tika.utils.DateUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-19
 */
@Slf4j
public class CtfileUtil {
    private static final ExecutorService executorService = Executors.newFixedThreadPool(1);
    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        List<String> bl = FileUtils.readLines(new File("bookInfo/tianlang2022-06-19T00:54:12Z"), Charset.defaultCharset());
        for (int i = 27; i < bl.size(); i++ ){
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), TianLangCrawlerByJsoup.Book.class);
            Book book = getBook(booku.getUrl1(),booku.getPwd1());
            books.add(book);
            if(book == null || book.getName() == null || CollectionUtils.isEmpty(book.getUrls())){
                errorUrls.add(booku.getUrl1());
            }else {
                down(book);
               // futureList.add(CompletableFuture.runAsync(() -> down(finalI,book),executorService));
            }
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();

        String d = DateUtils.formatDate(new Date());
        save("bookInfo/ctfile" + d, books.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()));
        save("bookInfo/ctfile" + d + "error", errorUrls);
    }
    public static boolean download(String cturl, String pwd){
        try {
            Book book = getBook(cturl, pwd);
            return book !=null && down(book);
        }catch (Exception ignore){
            return false;
        }
    }

    private static boolean down(Book book){
        //log.info("download {}   {}", book.name);
        String dir = "/Users/hunliji/books/tianlang";
        String url = book.getUrls().get(0).getUrl();
        String name = book.name + "." + book.getUrls().get(0).getType();
        File file = new File(dir,name);
        if(file.exists()){
            log.info("已下载.{}",name);
            return true;
        }
        Map<String,String> map = HttpUtils.download(url, "", IP.getNewIP(),name, "1", dir);
        return map != null && map.containsKey("code");
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
                JSONObject file = getFileInfo(url,pwd);
                String folderName = file.getString("folder_name");
                String dirUrl = file.getString("url");
                JSONArray dir = getDir(dirUrl);
                List<BookUrl> urls = dir.stream().map( e -> {
                    Elements f = Jsoup.parse(((JSONArray)e).getString(1)).select(" a");
                    String tempDir = f.attr("href");
                    String name = f.text();
                    String urld = getFilechk(tempDir);
                    return BookUrl.builder().type(name.substring(name.lastIndexOf(".") + 1)).url(urld).build();
                }).sorted(Comparator.comparing(a -> Type.index(a.getType()))).collect(Collectors.toList());
                return Book.builder().name(folderName).urls(urls).build();
            });
    }

    public static JSONObject getFileInfo(String url, String pwd){
       // String u = "https://webapi.ctfile.com/getdir.php?path=d&d=18000254-49360899-bb4ee9&passcode=908047";
        url = url.trim();
        url = url.substring(0,url.lastIndexOf("?") > 0 ? url.lastIndexOf("?") : url.length() ).replace("https://url54.ctfile.com/d/","https://webapi.ctfile.com/getdir.php?path=d&d=");
        String rurl = url + "&passcode=" + pwd;
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
    public static String getFilechk(String tempDir){
        String rurl = "https://webapi.ctfile.com/getfile.php?path=f&f=" + tempDir.replace("/f/","");
        return doRetry(3,() ->{
            Map<String,String> map = HttpUtils.get(rurl, "");
            String a = map.get("body");
            JSONObject object = JSON.parseObject(a).getJSONObject("file");
            return getFileDownUrl(object.getString("userid"),object.getString("file_id"),object.getString("file_chk"));
        });
    }

    public static String getFileDownUrl(String uid, String fid, String fck){
        String rurl = String.format("https://webapi.ctfile.com/get_file_url.php?uid=%s&fid=%s&file_chk=%s",uid,fid,fck);
        return doRetry(3,() ->{
            Map<String,String> map = HttpUtils.get(rurl, "");
            String a = map.get("body");
            JSONObject object = JSON.parseObject(a);
            String u = object.getString("downurl");
            if (StringUtils.isEmpty(u)){
                throw new RuntimeException();
            }
            return u;
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
