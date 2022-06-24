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
public class TianLangCrawlerByJsoup {
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private static final ExecutorService ctExecutor = Executors.newFixedThreadPool(1);
    private static final BlockingQueue<Book> taskQueue = new LinkedBlockingQueue<>();

    private static final List<Book> books = new ArrayList<>();
    private static final List<Book> downLoaded = new ArrayList<>();
    private static final List<Book> downLoadederror = new ArrayList<>();
    private static final List<String> errorUrls = new ArrayList<>();
    private static final List<String> sizeZero = new ArrayList<>();

    public static void main(String[] args) throws IOException {
      //  crawlerAll();
        downAll(true, 1);
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
        if(onlyLanzou < 1 && !check)  startCtExecutor();
        List<CompletableFuture<Void>> futureList = new ArrayList<>();
        save("bookInfo/tianlangdowned", downLoaded.stream().map(e -> JSON.toJSONString(e,false)).collect(Collectors.toList()),true);
        List<String> downloadList = FileUtils.readLines(new File("bookInfo/tianlangdowned"), Charset.defaultCharset());
        Set<String> downloadNames = new TreeSet<>();
        for(String s : downloadList){
            if(StringUtils.isEmpty(s)){
                continue;
            }
            TianLangCrawlerByJsoup.Book booku = JSON.parseObject(s, TianLangCrawlerByJsoup.Book.class);
            downloadNames.add(booku.getName());
        }
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

            if(i != 0 && i % 100 == 0){
                midDone(futureList);
            }
            int finalI = i;
            try{
                if(!StringUtils.isEmpty(booku.getUrl2())
                        && !booku.getUrl2().contains("ctfile.com")
                        && !booku.getUrl2().contains("z701.com")
                        && !booku.getUrl2().contains("306t.com")){
                    if(onlyLanzou < 0){
                        continue;
                    }
                    futureList.add(CompletableFuture.runAsync(() -> {
                        log.info("try download {}  {}", finalI, booku.name);
                        String url = booku.getUrl2().replace("https://wws.lanzous.com","https://tianlangbooks.lanzouf.com");
                        if(url.contains("www.tianlangbooks.com/redirect")){
                            url = redirctInfo(url);
                        }
                         if(LanzouUtil.download(url, booku.getPwd2(),check)){
                             if(!check) downLoaded.add(booku);
                         }else {
                             if(!check) downLoadederror.add(booku);
                         }
                    },executorService));
                }else if(!StringUtils.isEmpty(booku.getName())) {
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
        save("bookInfo/tianlangdowned", downLoaded.stream().map(e -> JSON.toJSONString(e, false)).collect(Collectors.toList()), true);
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
                       if(book.getUrl1() == null){
                           break;
                       }
                       String url = book.getUrl1().replace("z701.com","url54.ctfile.com").replace("306t.com","url54.ctfile.com");
                       if(url.contains("www.tianlangbooks.com/redirect")){
                           url = redirctInfo(url);
                       }
                       if(CtfileUtil.download(url,book.getPwd1())){
                           downLoaded.add(book);
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
