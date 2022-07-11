package com.example.tools.mycrawler.tianlang;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.ctfile.CtfileUtil;
import com.example.tools.mycrawler.epubee.IP;
import com.example.tools.mycrawler.lanzou.LanzouUtil;
import com.example.tools.mycrawler.util.Streams;
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
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-18
 */
@Slf4j
public class TianLangCrawlerByJsoup {
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);

    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();
    private static final List<String> sizeZero = new ArrayList<>();

    private static final List<Book> downLoadederror = new ArrayList<>();

    public static void main(String[] args) throws IOException {
      //  crawlerAll();
        downAll(false, 0);
    }

    public static void crawlerAll() {
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
    public static void downAll(boolean check, int onlyLanzou) throws IOException {
        save("bookInfo/tianlangdowned", Collections.emptyList(),true);
        List<String> downloadList = FileUtils.readLines(new File("bookInfo/tianlangdowned"), Charset.defaultCharset());
        Set<String> downloadNames = Streams.stream(downloadList).filter(e -> !StringUtils.isEmpty(e)).map(e -> JSON.parseObject(e, TianLangCrawlerByJsoup.Book.class).getName()).toSet();
        LanzouUtil lanzouUtil = new LanzouUtil(10);
        List<CompletableFuture<Boolean>> futureList = new ArrayList<>();
        List<String> bl = FileUtils.readLines(new File("bookInfo/tianlang2022-06-23T14:12:49Z"), Charset.defaultCharset());
        for (int i = 0; i < bl.size(); i++ ){
            if(StringUtils.isEmpty(bl.get(i))){
                continue;
            }
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), TianLangCrawlerByJsoup.Book.class);
            if((check && !downloadNames.contains(booku.getName())) || (!check && downloadNames.contains(booku.getName()))){
                log.info( (check ? "未" : "已") + "下载，跳过 {} {}", i ,booku.getName());
                continue;
            }

            int finalI = i;

            BiConsumer<? super Boolean,? super Throwable> onComplete = (r,e) -> {
                if(!check && e == null){
                    if(r){
                        save("bookInfo/tianlangdowned", Collections.singletonList( JSON.toJSONString(booku, false)), true);
                    }else{
                        downLoadederror.add(booku);
                    }
                }
            };
            try{
                boolean lanzou = !StringUtils.isEmpty(booku.getUrl2())
                        && !booku.getUrl2().contains("ctfile.com")
                        && !booku.getUrl2().contains("z701.com")
                        && !booku.getUrl2().contains("306t.com");
                boolean ct = !lanzou && !StringUtils.isEmpty(booku.getName()) && !check && onlyLanzou <= 0;
                lanzou = lanzou && onlyLanzou >= 0;
                if(!lanzou && !ct){
                    continue;
                }
                Supplier<String> getUrl = () -> {
                    log.info("try download {}  {}", finalI, booku.name);
                    String url = !ct
                            ? booku.getUrl2().replace("https://wws.lanzous.com","https://tianlangbooks.lanzouf.com")
                            : booku.getUrl1().replace("z701.com","url54.ctfile.com").replace("306t.com","url54.ctfile.com");
                    if(url.contains("www.tianlangbooks.com/redirect")){
                        url = redirctInfo(url);
                    }
                    return url;
                };
                CompletableFuture<Boolean> future =  lanzou
                        ? lanzouUtil.submitDownTask(getUrl,booku.getPwd2(),check).whenComplete(onComplete)
                        : CtfileUtil.submitDownTask(getUrl,booku.getPwd1()).whenComplete(onComplete);
                futureList.add(future);
            }catch (Exception e){
                downLoadederror.add(booku);
            }
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();
        futureList.clear();
        String d = DateUtils.formatDate(new Date());
        save("bookInfo/tianlangdownerror" + d, downLoadederror.stream().map(e -> JSON.toJSONString(e, false)).collect(Collectors.toList()));
        downLoadederror.clear();
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
                    book.name(name).url1(redirctInfo(rurl)).pwd1(pwd);
                }else {
                    book.name(name).url2(redirctInfo(rurl)).pwd2(pwd);
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
    public static String redirctInfo(String rurl){
        Function<Element,String> exa = element2 -> {
            String a = element2.dataNodes().get(0).toString();
            int b = a.indexOf("location.href = ");
            int c = a.indexOf("}");
            return a.substring(b,c).replace("location.href = ","").trim().replace("\"","").replace(";","");
        };

        String[] a = new String[1];
        visitPage(rurl,"body > script",1, e2 -> a[0] = exa.apply(e2));
        return a[0];
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
        save(path, vs,false);
    }
    private static void save(String path,List<String> vs,boolean apppend) {
        try {
            log.info("文件" + (apppend? "追加到" : "保存到") + path );
            FileUtils.writeLines(new File(path), vs, apppend);
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
