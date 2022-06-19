package com.example.tools.mycrawler.tianlang;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.ctfile.CtfileUtil;
import com.example.tools.mycrawler.epubee.IP;
import com.example.tools.mycrawler.lanzou.LanzouUtil;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.tika.utils.DateUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-18
 */
@Slf4j
public class TianLangCrawlerByJsoup {
    private static ExecutorService executorService = Executors.newFixedThreadPool(50);

    private static List<Book> books = new ArrayList<>();
    private static List<String> errorUrls = new ArrayList<>();
    private static List<String> sizeZero = new ArrayList<>();

    public static void main(String[] args){


        crawlerAll();
    }

    private static void crawlerAll() {
        String root = "https://www.tianlangbooks.com/articles/page/";
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        for (int i = 1; i <= 387; i++){
            String url = root+ i + "/";
            futureList.add(CompletableFuture.runAsync(() -> books.addAll(crawler(url)),executorService));
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();
        String d = DateUtils.formatDate(new Date());
        save("bookInfo/tianlang"+ d, books.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()));
        save("bookInfo/"+ d + "error", errorUrls);
        save("bookInfo/"+ d + "zero", sizeZero);
    }
    public static void downloadBook(TianLangCrawlerByJsoup.Book booku){
        if(booku.getUrl2() != null){

        }else {
            CtfileUtil.Book book =  doRetry(3,() -> CtfileUtil.getBook(booku.getUrl1(),booku.getPwd1()));

        }
    }

    private static void down(int i, String name, String url){
        log.info("download {}   {}", i, name);
        HttpUtils.download(url, "", IP.getNewIP(), name, "1", "/Users/hunliji/books/tianlang-lanzou");
    }

    public static List<Book> crawler(String url){
        log.info("开始 {}" ,url);
        List<Book> list = new ArrayList<>();
        visitPage(url,"#main-wrap-left > div.bloglist-container.clr > article > div.home-blog-entry-text.clr > h3 > a",3, element -> {
            String bookUrl = element.attr("href");
            Book book = getBookInfo(bookUrl);
            list.add(book);
        });
        log.info("结束 {}      {}" , url, list.size());
        if (list.size() == 0){
            sizeZero.add(url);
        }
        return list;
    }

    private static Book getBookInfo(String bookUrl) {
        Book.BookBuilder book = Book.builder();
        step2(bookUrl,"#main-wrap-left > div.content > div.single-text > div.secret-password-content",3, element1 -> {
            Function<Element,String> exa = element2 -> {
                String a = element2.dataNodes().get(0).toString();
                int b = a.indexOf("location.href = ");
                int c = a.indexOf("}");
                return a.substring(b,c).replace("location.href = ","").trim().replace("\"","").replace(";","");
            };
            Elements elements = element1.select("> p > a");
            if(elements.size() == 0){
                elements = element1.parent().select("> p > a");
            }
            elements.forEach( e -> {
                String name = e.text();
                String type = e.parent().text();
                String pwd = null;
                String rurl = e.attr("href");
                if(e.parent().select("span").size() > 0){
                    type = e.parent().select("span").get(0).text();
                    if(e.parent().select("span").size() > 1){
                        pwd = e.parent().select("span").get(1).text().replace("密码：","");
                    }
                }
                if(type.contains("城通网盘")){
                    book.name(name).url1(rurl).pwd1(pwd);
                    visitPage(rurl,"body > script",1, e2 -> book.url1(exa.apply(e2)));
                }else {
                    book.name(name).url2(rurl).pwd2(pwd);
                    visitPage(rurl,"body > script",1, e2 -> book.url2(exa.apply(e2)));
                }
            });
        });
        if(book.name == null){
            errorUrls.add(bookUrl);
        }
        return book.build();
    }

    private static void step2(String url, String select, int restry, Consumer<Element> visit) {
        doRetry(restry,() -> {
            Document listPage = Jsoup.connect(url).data("secret_key","359198","Submit","提交").header("Content-Type","application/x-www-form-urlencoded").post();
            Elements links = listPage.select(select);
            links.forEach(visit);
            return null;
        });
    }

    public static void visitPage(String url, String select, int restry, Consumer<Element> visit) {
        doRetry(restry,() -> {
            Document listPage = Jsoup.connect(url).get();
            Elements links = listPage.select(select);
            links.forEach(visit);
            return null;
        });
    }

    private static void save(String path,List<String> vs) {
        try {
            log.info("文件保存" + path );
            FileUtils.writeLines(new File(path), vs);
        } catch (IOException e) {
            log.error("文件保存异常" + path, e);
        }
    }


    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Accessors(chain = true)
    public static class Book{
        private String name;
        private String url1;
        private String pwd1;
        private String url2;
        private String pwd2;

    }

}
