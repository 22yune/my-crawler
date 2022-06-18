package com.example.tools.mycrawler.tianlang;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.MeBookCrawlerByJsoup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.tika.utils.DateUtils;
import org.jsoup.Jsoup;
import org.jsoup.helper.DataUtil;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.concurrent.*;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @author yi_jing
 * @date 2022-06-18
 */
@Slf4j
public class TianLangCrawlerByJsoup {
    private static ExecutorService executorService = Executors.newFixedThreadPool(10);

    private static List<Book> books = new ArrayList<>();

    public static void main(String[] args){
        String root = "https://www.tianlangbooks.com/articles/page/";
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        for (int i = 1; i <= 387; i++){
            String url = root+ i + "/";
            futureList.add(CompletableFuture.runAsync(() -> crawler(url),executorService));
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();
        save("bookInfo/"+ DateUtils.formatDate(new Date()));
    }


    public static void crawler(String url){
        log.info("开始 {}" ,url);
        visitPage(url,"#main-wrap-left > div.bloglist-container.clr > article > div.home-blog-entry-text.clr > h3 > a",1, element -> {
            String bookUrl = element.attr("href");
            Book.BookBuilder book = Book.builder();
            step2(bookUrl,"#main-wrap-left > div.content > div.single-text > div.secret-password-content",1, element1 -> {
                Function<Element,String> exa = element2 -> {
                    String a = element2.dataNodes().get(0).toString();
                    int b = a.indexOf("location.href = ");
                    int c = a.indexOf("}");
                    return a.substring(b,c).replace("location.href = ","").trim().replace("\"","").replace(";","");
                };

                element1.select("> p > a").forEach( e -> {
                    String name = e.text();
                    String type = e.parent().select("span").get(0).text();
                    String rurl = e.attr("href");
                    String pwd = e.parent().select("span").get(1).text().replace("密码：","");
                    if(type.contains("城通网盘")){
                        book.name(name).url1(rurl).pwd1(pwd);
                        visitPage(rurl,"body > script",1, e2 -> book.url1(exa.apply(e2)));
                    }else {
                        book.name(name).url2(rurl).pwd2(pwd);
                        visitPage(rurl,"body > script",1, e2 -> book.url2(exa.apply(e2)));
                    }
                });
            });
            books.add(book.build());
        });
        log.info("结束 {}      {}" , url, books.size() );
    }

    public static void step2(String url, String select, int restry, Consumer<Element> visit) {
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

    public static void doRetry( int restry, Callable runnable){
        if (restry <= 0) {
            return;
        }
        try {
            runnable.call();
        } catch (Exception e) {
            try {
                Thread.sleep(new Random().nextInt(1000));
            } catch (InterruptedException e1) {
            }
            if (restry < 1) {
                e.printStackTrace();
                return;
            }
            doRetry( restry - 1, runnable);
        }
    }

    private static void save(String path) {
        try {
            log.info("文件保存" + path );
            FileUtils.writeLines(new File(path),books.stream().map(e -> {
                String s = JSON.toJSONString(e,false);
                return s;
            }).collect(Collectors.toList()));
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
