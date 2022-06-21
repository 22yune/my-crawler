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
import org.apache.tika.utils.DateUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

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

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-19
 */
@Slf4j
public class LanzouUtil {
    private static final String dir = "/Users/hunliji/books/tianlang-lanzou";
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();


    public static void main(String[] args) throws IOException {

        //FileUtils.writeLines(new File(dir,"files.txt"), FileUtils.listFiles(new File(dir),null,false).stream().map(File::getName).collect(Collectors.toList()));


        /*String a = "https://develope.lanzoug.com/file/?UDYCPAEwBTRTWgA4AzZcMFZpBj4DugKyVupRs1y4BpFQv1O4D8hS4wX3UaBX5VfuB9hXt1+4C5QH5QCdULEH4VDKAtEBuQXUU7EAsgPtXPxW6QaTA/MC51b1Ue1cLgZ9UDlTdA90UmAFOlFrV2ZXCQc0VzZfPQs+BzMAN1A7BzVQaAJlAW8Fd1NjACUDalxuVjwGMANrAjBWYlFgXCYGd1AgUzkPYFI2BWFRNVcsV2YHa1d9XzELPgcvAGBQbwdjUGkCYwFuBTVTMQBuA2Ncb1Y/BjEDPwJmVjdRM1w3BjRQNVNgD2tSMQViUWNXZ1cwB2hXMF9iC2sHYQAoUHYHb1AgAnMBKQUiU2AAJAM+XDlWMQYyA2oCNFZkUWZcMwY0UHZTcA87UmsFNlFhVz5XZwdtV2JfMAs5By4AKFAqB2BQPAIiAWEFYFMzAGMDYlxrVj4GNQNuAjBWYVFxXHUGd1AnUzkPY1IwBWZRMlc3V2QHZVdmXzMLOgcmAHNQZQd2UG0CZAFuBWRTKwBnA2ZcalYiBjIDZAIuVmBRYlwy";
        down(22, Book.builder().name("ee").url(a).build());*/

        String url = "https://tianlangbooks.lanzouf.com/b01p8tjjc";
        download(url, "tlsw");
    }

    private static void downloadTianlang() throws IOException {
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        List<String> bl = FileUtils.readLines(new File("bookInfo/tianlang2022-06-19T00:54:12Z"), Charset.defaultCharset());
        for (int i = 26; i < bl.size(); i++ ){
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), TianLangCrawlerByJsoup.Book.class);
            Book book = getFileInfo(booku.getUrl2(),booku.getPwd2());
            books.add(book);
            if(book == null || book.getName() == null || book.getUrl() == null){
                errorUrls.add(booku.getUrl1());
            }else {
                futureList.add(CompletableFuture.runAsync(() -> down(book.name, book.url),executorService));
            }
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();

        String d = DateUtils.formatDate(new Date());
        save("bookInfo/ctfile" + d, books.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()));
        save("bookInfo/ctfile" + d + "error", errorUrls);
    }

    public static boolean download(String lanzUrl, String pwd){
        try {
            Book book = getFileInfo(lanzUrl, pwd);
            return book != null && down(book.name, book.url);
        }catch (Exception ignore){
            return false;
        }
    }

    private static boolean down(String name, String url){
        //log.info("download {}   {}", name);
        Map<String,String> heads = new HashMap<>();
        heads.put("accept-language", "zh-CN,zh;q=0.9");
        File file = new File(dir,name);
        if(file.exists()){
            log.info("已下载.{}",name);
            return true;
        }
        Map<String,String> map = HttpUtils.download(url, "down_ip=1", IP.getNewIP(), name, "1", "/Users/hunliji/books/tianlang-lanzou",heads);
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
                return p;
            }
        });
    }

    public static Book getFileInfo(String url, String pwd){
        String[] param = getFilePostData(url,pwd);
        boolean isC = param.length != 6;
        return isC ? getFilDir(url, param, pwd) : getFile(url,param);
    }
    private static Book getFile(String url,String[] param){
        String u = "https://tianlangbooks.lanzouf.com/ajaxm.php";
        return doRetry(3,() -> {
            Document listPage = Jsoup.connect(u).data(param).header("Content-Type","application/x-www-form-urlencoded").header("referer", url).post();
            JSONObject object = JSON.parseObject(listPage.text());
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
        String urlf = getUrlbyid(id);
        Book book = getFile(urlf,getFilePostData(urlf,""));
        book.setName(name);
        return book;
    }
    private static String getUrlbyid(String id){
        String root = "https://tianlangbooks.lanzouf.com";
        String u = root+"/"+id;
        return doRetry(3, () -> {
            Document listPage = Jsoup.connect(u).get();
            return root + listPage.select("body > div > div > div > iframe").attr("src");
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
