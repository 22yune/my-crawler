package com.example.tools.mycrawler.sobooks;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.ctfile.CtfileUtil;
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
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.example.tools.mycrawler.util.CommonUtil.doRetry;

/**
 * @author yi_jing
 * @date 2022-06-18
 */
@Slf4j
public class SoBooksCrawlerByJsoup {
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private static final ExecutorService ctExecutor = Executors.newFixedThreadPool(1);
    private static final BlockingQueue<Book> taskQueue = new LinkedBlockingQueue<>();

    private static final String downPath = "bookInfo/sobooksdowned";

    private static final List<Book> books = new ArrayList<>();
    private static final List<Book> downLoaded = new ArrayList<>();
    private static final List<Book> downLoadederror = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();
    private static final List<String> sizeZero = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        String url = "https://sobooks.net/page/2";
        //crawler(url);
        crawlerAll();
     //   downAll(true, 1);
    }

    public static void crawlerAll() {
        String root = "https://sobooks.net/page/";
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        for (int i = 1; i <= 387; i++){
            String url = root+ i + "/";
            futureList.add(CompletableFuture.runAsync(() -> books.addAll(crawler(url)),executorService));
        }
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        future.join();
        String d = DateUtils.formatDate(new Date());
        save("bookInfo/sobooks"+ d, books.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()));
        save("bookInfo/sobooks"+ d + "error", errorUrls);
        save("bookInfo/sobooks"+ d + "zero", sizeZero);
    }
    public static void downAll(boolean check, int onlyLanzou) throws IOException {
        if(onlyLanzou < 1 && !check)  startCtExecutor();
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        save(downPath, downLoaded.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()),true);
        List<String> downloadList = FileUtils.readLines(new File(downPath), Charset.defaultCharset());
        Set<String> downloadNames = new TreeSet<>();
        for(String s : downloadList){
            if(StringUtils.isEmpty(s)){
                continue;
            }
            SoBooksCrawlerByJsoup.Book booku = JSON.parseObject(s, SoBooksCrawlerByJsoup.Book.class);
            downloadNames.add(booku.getName());
        }
        List<String> bl = FileUtils.readLines(new File("bookInfo/tianlang2022-06-23T14:12:49Z"), Charset.defaultCharset());
        for (int i = 0; i < bl.size(); i++ ){
            if(StringUtils.isEmpty(bl.get(i))){
                continue;
            }
            SoBooksCrawlerByJsoup.Book booku = JSON.parseObject(bl.get(i), SoBooksCrawlerByJsoup.Book.class);
            if((check && !downloadNames.contains(booku.getName())) || (!check && downloadNames.contains(booku.getName()))){
                log.info( (check ? "未" : "已") + "下载，跳过 {} {}", i ,booku.getName());
                continue;
            }

            if(i != 0 && i % 100 == 0){
                midDone(futureList);
            }
            int finalI = i;
            try{
                BookUrl bookUrl = booku.getUrls().get(0);
                if(bookUrl.getType() == UrlType.LZ && !StringUtils.isEmpty(bookUrl.getUrl())){
                    if(onlyLanzou < 0){
                        continue;
                    }
                    futureList.add(CompletableFuture.runAsync(() -> {
                        log.info("try download {}  {}", finalI, booku.name);
                        String url = bookUrl.getUrl();
                         if(LanzouUtil.download(url, bookUrl.getPwd(),check)){
                             if(!check) downLoaded.add(booku);
                         }else {
                             if(!check) downLoadederror.add(booku);
                         }
                    },executorService));
                }else if(bookUrl.getType() == UrlType.CT && !StringUtils.isEmpty(bookUrl.getUrl())) {
                    taskQueue.offer(booku);
                }
            }catch (Exception e){
                downLoadederror.add(booku);
            }
        }
        midDone(futureList);

        taskQueue.add(Book.builder().build());
        executorService.shutdown();
        ctExecutor.shutdown();
        while (true){
            try {
                ctExecutor.awaitTermination(1,TimeUnit.MINUTES);
                executorService.awaitTermination(1,TimeUnit.MINUTES);
                if(ctExecutor.isTerminated() && executorService.isTerminated()){
                    break;
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        midDone(futureList);

    }

    private static void midDone(List<CompletableFuture<Void>> futureList) {
        CompletableFuture<Void> future = CompletableFuture.allOf(futureList.toArray(new CompletableFuture[0]));
        futureList.clear();
        future.join();
        String d = DateUtils.formatDate(new Date());
        save(downPath, downLoaded.stream().map(e -> JSON.toJSONString(e, false)).collect(Collectors.toList()), true);
        downLoaded.clear();
        save("bookInfo/tianlangdownerror" + d, downLoadederror.stream().map(e -> JSON.toJSONString(e, false)).collect(Collectors.toList()));
        downLoadederror.clear();
    }

    private static void startCtExecutor(){
        ctExecutor.submit(() -> {
           while (true){
               try {
                   Book book = taskQueue.poll(1000,TimeUnit.MILLISECONDS);
                   if(book != null ){
                       if(book.getUrls().get(0).getUrl() == null){
                           break;
                       }
                       String url = book.getUrls().get(0).getUrl().replace("z701.com","url54.ctfile.com").replace("306t.com","url54.ctfile.com");
                       if(CtfileUtil.download(url,book.getUrls().get(0).getPwd())){
                           save(downPath, Collections.singletonList( JSON.toJSONString(book, false)), true);
                       }else {
                           downLoadederror.add(book);
                       }
                   }
               } catch (InterruptedException e) {
                   e.printStackTrace();
               }
           }
        });
    }

    public static List<Book> crawler(String url){
        log.info("开始 {}" ,url);
        List<Book> list = new ArrayList<>();
        visitPage(url,"#cardslist > div > div > div > a > img",3, element -> {
            String bookUrl = element.parent().attr("href");
            String bookName = element.parent().attr("title");
            Book book = getBookInfo(bookUrl, bookName);
            list.add(book);
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
            Elements elements = element1.select("> b > a");
            List<BookUrl> list = Streams.stream(elements).map(e -> {
                String type = e.previousSibling().toString();
                String url = e.attr("href").replace("https://sobooks.net/go.html?url=","").trim();
                String pwd = Optional.ofNullable(e.nextSibling()).map(ee -> ee.toString().replace(" 密码：","").trim()).orElse(null);
                return BookUrl.builder().url(url).pwd(pwd).type(UrlType.to(type)).build();
            }).sorted(Comparator.comparing(ee -> ee.getType().ordinal())).collect(Collectors.toList());
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
