package com.example.tools.mycrawler.sobooks;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.ctfile.CtfileUtil;
import com.example.tools.mycrawler.lanzou.LanzouUtil;
import com.example.tools.mycrawler.library.BookLibrary;
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
import org.springframework.util.CollectionUtils;
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
public class SoBooksCrawlerByJsoup {
    private static final ExecutorService executorService = Executors.newFixedThreadPool(2);

    private static final String defaultStoreDir = "/Volumes/Untitled/Books/sobooks-lanzou";//"/Users/hunliji/books/tianlang-lanzou";
    private static final String defaultDownDir = "/Users/hunliji/books/sobooks-lanzou";
    private static final String downPath = "bookInfo/sobooksdowned";

    private static final List<Book> books = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();
    private static final List<String> sizeZero = new ArrayList<>();

    private static final List<Book> downLoadederror = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        String url = "https://sobooks.net/page/2";
        //crawler(url);
      //  crawlerAll();
      //  LanzouUtil.unZipDir(defaultDownDir,defaultDownDir + "/unzip");
        downAll(false, 1);
    }

    public static void crawlerAll() throws IOException {
        String root = "https://sobooks.net/page/";
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        for (int i = 1; i <= 380; i++){
            String url = root+ i + "/";
            futureList.add(CompletableFuture.runAsync(() -> books.addAll(crawler(url)),executorService));
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();

        /*List<String> errors = FileUtils.readLines(new File("bookInfo/sobooks2022-07-06T06:14:07Zerror"), Charset.defaultCharset());
        errors.forEach( e -> {
            Book book = getBookInfo(e, null);
            if(!CollectionUtils.isEmpty(book.getUrls())){
                books.add(book);
            }
        } );*/

        String d = DateUtils.formatDate(new Date());
        save("bookInfo/sobooks"+ d, books.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()));
        save("bookInfo/sobooks"+ d + "error", errorUrls);
        save("bookInfo/sobooks"+ d + "zero", sizeZero);
    }

    public static void downAll(boolean check, int onlyLanzou) throws IOException {
        save(downPath, Collections.emptyList(),true);
        List<String> downloadList = FileUtils.readLines(new File(downPath), Charset.defaultCharset());
        Set<String> downloadNames = Streams.stream(downloadList).filter(e -> !StringUtils.isEmpty(e)).map(e -> JSON.parseObject(e, SoBooksCrawlerByJsoup.Book.class).getName()).toSet();
        LanzouUtil lanzouUtil = new LanzouUtil("sobooks", defaultStoreDir,defaultDownDir,10);
        lanzouUtil.setBookLibrary(new BookLibrary());
        List<CompletableFuture<Boolean>> futureList = new ArrayList<>();
        List<String> bl = FileUtils.readLines(new File("bookInfo/sobooks2022-07-06T05:38:30Z"), Charset.defaultCharset());
        for (int i = 0; i < bl.size() && i < 90000; i++ ){
            if(StringUtils.isEmpty(bl.get(i))){
                continue;
            }
            SoBooksCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), SoBooksCrawlerByJsoup.Book.class);
            if((check && !downloadNames.contains(booku.getName())) || (!check && downloadNames.contains(booku.getName()))){
                log.info( (check ? "未" : "已") + "下载，跳过 {} {}", i ,booku.getName());
                continue;
            }

            int finalI = i;
            BookUrl bookUrl = booku.getUrls().get(0);

            BiConsumer<? super Boolean,? super Throwable> onComplete = (r, e) -> {
                if(!check && e == null){
                    if(r){
                        save(downPath, Collections.singletonList( JSON.toJSONString(booku, false)), true);
                    }else{
                        downLoadederror.add(booku);
                    }
                }
            };
            try{
                boolean lanzou = bookUrl.getType() == UrlType.LZ
                        && !StringUtils.isEmpty(bookUrl.getUrl());
                boolean ct = !lanzou && bookUrl.getType() == UrlType.CT && !StringUtils.isEmpty(bookUrl.getUrl()) && !check && onlyLanzou <= 0;;
                lanzou = lanzou && onlyLanzou >= 0;
                if(!lanzou && !ct){
                    continue;
                }
                Supplier<String> getUrl = () -> {
                    log.info("try download {}  {}", finalI, booku.name);
                    return !ct ? bookUrl.getUrl() : bookUrl.getUrl().replace("z701.com","url54.ctfile.com").replace("306t.com","url54.ctfile.com");
                };
                String pwd = Optional.ofNullable(bookUrl.getPwd()).map(e -> e.replace("×","x")).orElse(null);
                CompletableFuture<Boolean> future =  lanzou
                        ? lanzouUtil.submitDownTask(getUrl, pwd, check, booku.getName()).whenComplete(onComplete)
                        : CtfileUtil.submitDownTask(getUrl, pwd, check, booku.getName()).whenComplete(onComplete);
                futureList.add(future);
            }catch (Exception e){
                log.error("",e);
                downLoadederror.add(booku);
            }
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();
        futureList.clear();
        String d = DateUtils.formatDate(new Date());
        save("bookInfo/sobooksdownerror" + d, downLoadederror.stream().map(e -> JSON.toJSONString(e, false)).collect(Collectors.toList()));
        downLoadederror.clear();
    }

    public static List<Book> crawler(String url){
        log.info("开始 {}" ,url);
        List<Book> list = new ArrayList<>();
        visitPage(url,"#cardslist > div > div > div > a > img",3, element -> {
            String bookUrl = element.parent().attr("href");
            String bookName = element.parent().attr("title");
            Book book = getBookInfo(bookUrl, bookName);
            if(!CollectionUtils.isEmpty(book.getUrls())){
                list.add(book);
            }
        });
        log.info("结束 {}      {}" , url, list.size());
        if (list.size() == 0){
            sizeZero.add(url);
        }
        return list;
    }

    private static Book getBookInfo(String bookUrl,String bookName) {
        Book.BookBuilder book = Book.builder().name(bookName);
        step2(bookUrl,"body > section > div.content-wrap > div > article > div.e-secret",3, element1 -> {
            if(book.name == null){
                String n = element1.ownerDocument().select("body > section > div.content-wrap > div > header > h1 > a").text();
                book.name(n);
            }
            Elements elements = element1.select("> b > a");
            String pwdA = null;
            Function<Element,String> typeF = e -> e.previousSibling().toString();
            if(elements.size() == 0){
                elements = element1.parent().select("> a");
                if(elements.size() == 0){
                    elements = element1.parent().select("> p > a");
                    typeF = Element::text;
                    if(element1.select("b").text().contains("密码")){
                        pwdA = element1.select("b").text().replace("提取密码：","");
                    }
                }
            }
            String finalPwdA = pwdA;
            Function<Element, String> finalTypeF = typeF;
            List<BookUrl> list = Streams.stream(elements).map(e -> {
                String type = finalTypeF.apply(e);
                String url = e.attr("href").replace("https://sobooks.net/go.html?url=","").trim();
                if(url.contains("books/tag/")){
                    return null;
                }
                String pwd = Optional.ofNullable(e.nextSibling())
                        .filter( ee -> ee.toString().contains("密码"))
                        .map(ee -> ee.toString().replace(" 密码：","").replace("密码:","").trim())
                        .filter(ee -> !ee.contains("<")).orElse(finalPwdA);
                return BookUrl.builder().url(url).pwd(pwd).type(UrlType.to(type)).build();
            }).filter(Objects::nonNull).sorted(Comparator.comparing(ee -> ee.getType().ordinal())).collect(Collectors.toList());
            book.urls(list);
        });
        if(book.urls == null || book.urls.size() == 0){
            errorUrls.add(bookUrl);
        }
        return book.build();
    }

    private static void step2(String url, String select, int restry, Consumer<Element> visit) {
        doRetry(restry,() -> {
            Document listPage = Jsoup.connect(url).data("e_secret_key","221217").header("Content-Type","application/x-www-form-urlencoded").post();
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
        private List<BookUrl> urls;
    }
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Accessors(chain = true)
    public static class BookUrl{
        private UrlType type;
        private String url;
        private String pwd;
    }

    public enum UrlType{
        LZ("蓝奏"),CT("城通"),SO("备份"),BD("百度"),OTHER("");
        private final String key;
        UrlType(String key){
            this.key = key;
        }
        public static UrlType to(String name){
            for (UrlType t : UrlType.values()){
                if(name != null && name.contains(t.key)){
                    return t;
                }
            }
            return OTHER;
        }
    }

}
