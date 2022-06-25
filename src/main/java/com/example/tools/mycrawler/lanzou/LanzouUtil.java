package com.example.tools.mycrawler.lanzou;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.ctfile.CtfileUtil;
import com.example.tools.mycrawler.epubee.IP;
import com.example.tools.mycrawler.tianlang.TianLangCrawlerByJsoup;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-19
 */
@Slf4j
public class LanzouUtil {
    private static final String storeDir = "/Volumes/Untitled 1/Books/tianlang-lanzou";//"/Users/hunliji/books/tianlang-lanzou";
    private static final String downDir = "/Users/hunliji/books/tianlang-lanzou";
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();
    private static final Set<String> fileNames = new TreeSet<>();
    static {
        try {
            fileNames.addAll(FileUtils.readLines(new File(storeDir, "files.txt"), Charset.defaultCharset()));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public static void main(String[] args) throws IOException {

        //FileUtils.writeLines(new File(dir,"files.txt"), FileUtils.listFiles(new File(dir),null,false).stream().map(File::getName).collect(Collectors.toList()));


        /*String a = "https://develope.lanzoug.com/file/?UDYCPAEwBTRTWgA4AzZcMFZpBj4DugKyVupRs1y4BpFQv1O4D8hS4wX3UaBX5VfuB9hXt1+4C5QH5QCdULEH4VDKAtEBuQXUU7EAsgPtXPxW6QaTA/MC51b1Ue1cLgZ9UDlTdA90UmAFOlFrV2ZXCQc0VzZfPQs+BzMAN1A7BzVQaAJlAW8Fd1NjACUDalxuVjwGMANrAjBWYlFgXCYGd1AgUzkPYFI2BWFRNVcsV2YHa1d9XzELPgcvAGBQbwdjUGkCYwFuBTVTMQBuA2Ncb1Y/BjEDPwJmVjdRM1w3BjRQNVNgD2tSMQViUWNXZ1cwB2hXMF9iC2sHYQAoUHYHb1AgAnMBKQUiU2AAJAM+XDlWMQYyA2oCNFZkUWZcMwY0UHZTcA87UmsFNlFhVz5XZwdtV2JfMAs5By4AKFAqB2BQPAIiAWEFYFMzAGMDYlxrVj4GNQNuAjBWYVFxXHUGd1AnUzkPY1IwBWZRMlc3V2QHZVdmXzMLOgcmAHNQZQd2UG0CZAFuBWRTKwBnA2ZcalYiBjIDZAIuVmBRYlwy";
        down(22, Book.builder().name("ee").url(a).build());*/

      //  checkZipFile();
     //   download("https://tianlangbooks.lanzouf.com/iS8wAkwyp5g",null);

        download("https://tianlangbooks.lanzoui.com/ik8oSs0s1qd", "tlsw",false);
      //  downloadTianlang();
    }

    private static void checkZipFile() throws IOException {
        List<Book> errorZip = new ArrayList<>();
        String dir = storeDir;
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        List<String> downloadList = FileUtils.readLines(new File("bookInfo/tianlangdowned"), Charset.defaultCharset());
        Set<String> downloadNames = new TreeSet<>();
        for(String s : downloadList){
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(s, TianLangCrawlerByJsoup.Book.class);
            downloadNames.add(booku.getName());
        }
        List<String> bl = FileUtils.readLines(new File("bookInfo/tianlang2022-06-19T00:54:12Z"), Charset.defaultCharset());
        for (int i = 0; i < bl.size(); i++ ){
            if(StringUtils.isEmpty(bl.get(i))){
                continue;
            }
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), TianLangCrawlerByJsoup.Book.class);
            if(!downloadNames.contains(booku.getName())){
                log.info("未下载，跳过 {}",booku.getName());
                continue;
            }

            if(i != 0 && i % 50000 == 0){
                CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
                futureList.clear();
                future.join();
                save(dir + "/errorZip.txt", errorZip.stream().map(JSON::toJSONString).collect(Collectors.toList()));
                errorZip.clear();
            }
            int finalI = i;
            try {
                if(!StringUtils.isEmpty(booku.getUrl2())
                        && !booku.getUrl2().contains("ctfile.com")
                        && !booku.getUrl2().contains("z701.com")
                        && !booku.getUrl2().contains("306t.com")){
                    futureList.add(CompletableFuture.runAsync(() -> {
                        try {
                            String url = booku.getUrl2().replace("https://wws.lanzous.com","https://tianlangbooks.lanzouf.com");
                            if(url.contains("www.tianlangbooks.com/redirect")){
                                url = TianLangCrawlerByJsoup.redirctInfo(url);
                            }
                            Book b = getFileInfo(url, booku.getPwd2());
                            if(b.name.toUpperCase().endsWith(".ZIP")){
                                Boolean r = checkZip(dir,b.name);
                                if(r != null && !r){
                                    errorZip.add(new Book(booku.getName(),b.name));
                                    down(b.name, b.url,false);
                                }
                            }
                        }catch (Exception ignore){
                        }
                    },executorService));
                }
            }catch (Exception e){

            }
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        futureList.clear();
        future.join();
        save(dir + "/errorZip.txt", errorZip.stream().map(JSON::toJSONString).collect(Collectors.toList()));
        errorZip.clear();
        executorService.shutdown();
    }
    private static void downloadTianlang() throws IOException {
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        List<String> bl = FileUtils.readLines(new File("bookInfo/tianlangdownerror2022-06-21T11:52:40Z"), Charset.defaultCharset());
        for (int i = 0; i < bl.size(); i++ ){
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), TianLangCrawlerByJsoup.Book.class);
            Book book = doRetry(1,() -> getFileInfo(booku.getUrl2(),booku.getPwd2()));

            if(!(book == null || book.getName() == null || book.getUrl() == null)){
                down(book.name,book.url,false);
                //futureList.add(CompletableFuture.runAsync(() -> down(book.name, book.url),executorService));
            }
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();

    }

    public static boolean download(String lanzUrl, String pwd, boolean check){
        try {
            Book book = getFileInfo(lanzUrl, pwd);
            return book != null && down(book.name, book.url, check);
        }catch (Exception ignore){
            return false;
        }
    }

    private static boolean down(String name, String url, boolean check){
        File file = new File(storeDir,name);
        if(file.exists() || fileNames.contains(name)){
            if(check && name.toUpperCase().endsWith(".ZIP")){
                Boolean r = checkZip(storeDir,name);
                if(r != null && !r){
                    return doDown(url, name);
                }
            }
            return true;
        }else {
            if(!check){
                return doDown(url, name);
            }else {
                log.info("not exsist {}",name);
            }
            return true;
        }
    }
    private static boolean doDown(String url, String name){
        log.info(" dodownload  {}", name);
        Map<String,String> heads = new HashMap<>();
        heads.put("accept-language", "zh-CN,zh;q=0.9");
        Map<String,String> map = HttpUtils.download(url, "down_ip=1", IP.getNewIP(), name, "1", downDir,heads);
        boolean r = map != null && map.containsKey("code");
        if(!r){
            File file = new File(downDir,name);
            if(file.exists() && !file.delete()){
                log.warn("文件删除失败:{}", file.getName());
            }
        }
        return r;
    }

    private static void save(String path,List<String> vs) {
        try {
            log.info("文件保存" + path );
            FileUtils.writeLines(new File(path), vs, true);
        } catch (IOException e) {
            log.error("文件保存异常" + path, e);
        }
    }

    public static String[] getFilePostData(String url, String pwd){
        return doRetry(3, () -> {
            Document listPage = Jsoup.connect(url).get();
            String a = listPage.select("body > script").toString();
            int i = a.indexOf("data : '");
            int mi = a.indexOf("data : {");
            int fi = a.indexOf("function file");
            if(i > 0 ){
                int j = a.indexOf("'", i + 8);
                String u = a.substring(i + 8, j);
                String[] aa = u.split("=|&");
                return new String[]{aa[0],aa[1],aa[2],aa[3],aa[4],pwd};
            }else if(mi > 0 && fi < 0){
                String b = a.substring(mi + 8,a.indexOf("}", mi));
                String[] aa = b.replace("'","").split(":|,");
                String[] p = Arrays.stream(aa).map(String::trim).toArray(String[]::new);
                String c = a.substring(a.indexOf("var ajaxdata"), a.indexOf("$.ajax"));
                Pattern pa = Pattern.compile("\\=(.*?)\\;");//正则表达式，取=和|之间的字符串，不包括=和|
                Matcher m = pa.matcher(c);
                if(m.find()) p[3] = m.group(1).trim().replace("'","");
                if(m.find()) m.group(1);
                if(m.find()) p[11] = m.group(1).trim().replace("'","");
                if(m.find()) p[9] = m.group(1);
                return p;
            }else {
                if(listPage.select("body > div").toString().contains("文件取消分享了")){
                    log.info("文件取消分享了 {}",url);
                    return null;
                }
                String b = a.substring(a.indexOf("$.ajax") + 8,a.indexOf("dataType"));
                b = b.substring(b.indexOf("{") + 1,b.indexOf("}"));
                String c = a.substring(a.indexOf("var pwd;") + 8, a.indexOf("function file"));

                String[] aa = b.replace("'","").split(":|,");
                String[] p = Arrays.stream(aa).map(String::trim).toArray(String[]::new);
                p[p.length - 1] = pwd;
                Pattern pa = Pattern.compile("\\=(.*?)\\;");//正则表达式，取=和|之间的字符串，不包括=和|
                Matcher m = pa.matcher(c);
                if(m.find()) p[11] = m.group(1).trim().replace("'","");
                if(m.find()) p[13] = m.group(1).trim().replace("'","");
                if(m.find()) p[7] = m.group(1);
                if(p.length%2 != 0){
                    p = Arrays.copyOf(p, p.length - 1);
                }
                return p;
            }
        });
    }

    public static Book getFileInfo(String url, String pwd){
        if(pwd == null){
            try {
                return getFileByIdUrl(url);
            }catch (Exception ignored){
            }
        }
        String[] param = getFilePostData(url,pwd);
        boolean isC = param.length != 6;
        return isC ? getFilDir(url, param, pwd) : getFile(url,param);
    }
    private static Book getFile(String url,String[] param){
        String u = "https://tianlangbooks.lanzouf.com/ajaxm.php";
        return doRetry(3,() -> {
            Document listPage = Jsoup.connect(u).data(param).header("Content-Type","application/x-www-form-urlencoded").header("referer", url).post();
            JSONObject object = JSON.parseObject(listPage.text());
            if(object == null){
                return null;
            }
            String urll = object.getString("dom") + "/file/" + object.getString("url");
            return Book.builder().name(object.getString("inf")).url(urll).build();
        });
    }
    private static Book getFilDir(String url,String[] param, String pwd){
        try{
            return doGetFilDir(url,param);
        }catch (Exception e){
            return doRetry(2, () -> doGetFilDir(url, getFilePostData(url,pwd)));
        }
    }
    private static Book doGetFilDir(String url,String[] param) throws IOException{
        String u = "https://tianlangbooks.lanzouf.com/filemoreajax.php";
        Document listPage = Jsoup.connect(u).data(param).header("Content-Type","application/x-www-form-urlencoded").header("referer", url).post();
        JSONObject object = JSON.parseObject(listPage.text());
        JSONArray txt = object.getJSONArray("text");
        JSONObject first = (JSONObject) txt.stream().sorted(Comparator.comparing(ee -> CtfileUtil.Type.index(((JSONObject)ee).getString("icon")))).limit(1).findFirst().orElse(null);
        String name = first.getString("name_all");
        String id = first.getString("id");
        String root = "https://tianlangbooks.lanzouf.com";
        String idu = root+"/"+id;
        Book book = getFileByIdUrl(idu);
        book.setName(name);
        return book;
    }
    private static Book getFileByIdUrl(String url){
        Book book = getUrlbyid(url);
        String urlf = book.url;
        String pwd = "tlsw";
        Book b = getFile(urlf,getFilePostData(urlf,pwd));
        if(b == null){
            return getFilDir(url, getFilePostData(url,pwd), pwd);
        }
        if(!url.equals(urlf)){
            b.setName(book.name);
        }
        return b;
    }
    private static Book getUrlbyid(String url){
        String root = "https://tianlangbooks.lanzouf.com";
        return doRetry(3, () -> {
            Document listPage = Jsoup.connect(url).get();
            String rurl = root + listPage.select("body > div > div > div > iframe").attr("src");
            String name = listPage.select("body > div.d > div:nth-child(1)").text();
            return Book.builder().url(rurl.equals(root) ? url : rurl).name(name).build();
        });
    }

    public static String getRealFileUrl(String url){
        Map<String,String> heads = new HashMap<>();
        heads.put("accept-language", "zh-CN,zh;q=0.9");
        return doRetry(3, () -> {
            Map<String,String> a = HttpUtils.get(url,"down_ip=1");
            return a.get("Location");
        });
    }

    public static Boolean checkZip(String dir,String name){
        File file1 = new File(dir,name);
        if(!file1.exists()){
            return null;
        }
        try {
            ZipFile zipFile = new ZipFile(file1);
            log.info(" check zip  {} {} {}", name, zipFile.getName(), zipFile.size());
        } catch (ZipException e){
            log.error("error {} {}",name,e.getMessage());
            return false;
        }catch (IOException e) {
            log.error("error {} {}",name, e.getMessage());
            return null;
        }
        return true;
    }

    public static Boolean upZip(String dir,String name){
        return true;
    }


    @Data
    @Builder
    public static class Book{
        private String name;
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
