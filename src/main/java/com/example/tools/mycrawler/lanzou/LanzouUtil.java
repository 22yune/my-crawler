package com.example.tools.mycrawler.lanzou;

import com.alibaba.fastjson.JSON;
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
public class LanzouUtil {
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();


    public static void main(String[] args) throws IOException {
        /*String a = "https://develope.lanzoug.com/file/?UDYCPAEwBTRTWgA4AzZcMFZpBj4DugKyVupRs1y4BpFQv1O4D8hS4wX3UaBX5VfuB9hXt1+4C5QH5QCdULEH4VDKAtEBuQXUU7EAsgPtXPxW6QaTA/MC51b1Ue1cLgZ9UDlTdA90UmAFOlFrV2ZXCQc0VzZfPQs+BzMAN1A7BzVQaAJlAW8Fd1NjACUDalxuVjwGMANrAjBWYlFgXCYGd1AgUzkPYFI2BWFRNVcsV2YHa1d9XzELPgcvAGBQbwdjUGkCYwFuBTVTMQBuA2Ncb1Y/BjEDPwJmVjdRM1w3BjRQNVNgD2tSMQViUWNXZ1cwB2hXMF9iC2sHYQAoUHYHb1AgAnMBKQUiU2AAJAM+XDlWMQYyA2oCNFZkUWZcMwY0UHZTcA87UmsFNlFhVz5XZwdtV2JfMAs5By4AKFAqB2BQPAIiAWEFYFMzAGMDYlxrVj4GNQNuAjBWYVFxXHUGd1AnUzkPY1IwBWZRMlc3V2QHZVdmXzMLOgcmAHNQZQd2UG0CZAFuBWRTKwBnA2ZcalYiBjIDZAIuVmBRYlwy";
        down(22, Book.builder().name("ee").url(a).build());*/

        String url = "https://tianlangbooks.lanzouf.com/ig1uZ06klj8f";
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
        String dir = "/Users/hunliji/books/tianlang-lanzou";
        File file = new File(dir,name);
        if(file.exists()){
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

    public static String getFileUrl(String url){
        return doRetry(3, () -> {
            Document listPage = Jsoup.connect(url).get();
            String a = listPage.select("body > script").toString();
            int i = a.indexOf("data : '");
            int j = a.indexOf("'", i + 8);
            String u = a.substring(i + 8, j);
            return u;
        });
    }

    public static Book getFileInfo(String url, String pwd){
        String param = getFileUrl(url);
        String u = "https://tianlangbooks.lanzouf.com/ajaxm.php";
        String[] a = param.split("=|&");
        if(a.length != 5){
            log.error("error {} {} {}", url, pwd, param);
            return null;
        }

        return doRetry(3,() -> {
            Document listPage = Jsoup.connect(u).data(a[0],a[1],a[2],a[3],a[4],pwd).header("Content-Type","application/x-www-form-urlencoded").header("referer", url).post();
            JSONObject object = JSON.parseObject(listPage.text());
            String urll = object.getString("dom") + "/file/" + object.getString("url");
            return Book.builder().name(object.getString("inf")).url(urll).build();
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
}
