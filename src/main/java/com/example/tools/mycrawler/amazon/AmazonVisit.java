package com.example.tools.mycrawler.amazon;

import com.example.tools.mycrawler.epubee.Book;
import com.example.tools.mycrawler.epubee.EpubeeCrawlerNew;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Created by baogen.zhang on 2019/6/25
 *
 * @author baogen.zhang
 * @date 2019/6/25
 */
public class AmazonVisit {
    private static Logger logger = LoggerFactory.getLogger(AmazonVisit.class);

    private static final String AMAZON_HOST = "https://www.amazon.cn";

    public static Elements getElements(Document document,String select){
        Elements elements = document.select(select);
        return elements;
    }
    public static Document getDocument(String url ,int restry){
        if (restry <= 0) {
            return null;
        }
        try {
            Document document = Jsoup.connect(url).get();
            return document;
        } catch (IOException e) {
            try {
                Thread.sleep(new Random().nextInt(2000));
            } catch (InterruptedException e1) {
            }
            return getDocument(url, restry - 1);
        }
    }

    public static void getBook(Elements page,Consumer<Book> bookConsumer){
        String select = "div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-right-col div#zg-center-div ol#zg-ordered-list li.zg-item-immersion span.a-list-item";
        page.select(select).forEach(element -> {
            String price = element.select("div > span > div > a > span.a-color-price span").text();
            String author = element.select("div > span > div > span.a-color-base").text();
            String level = element.select("div > span > div > a > i > span").text();
            String link = AMAZON_HOST + element.select("div > span > a").attr("href");
            String bookName = element.select("div > span > a > div").text();
            logger.info("===BookName===" + bookName);
            bookConsumer.accept(new Book(bookName, author, level, price, link));
        });
    }

    public static Queue<Book> receiveBookInPage(String url, Consumer<Book> visit, AtomicBoolean parallel, int restry) {
        Queue<Book> books = new ConcurrentLinkedQueue<>();
        String select = "div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-right-col div#zg-center-div ol#zg-ordered-list li.zg-item-immersion span.a-list-item";
        Elements elements = getElements(getDocument(url,restry),select);
        Consumer<Element> elementConsumer = element -> {
            String price = element.select("div > span > div > a > span.a-color-price span").text();
            String author = element.select("div > span > div > span.a-color-base").text();
            String level = element.select("div > span > div > a > i > span").text();
            String link = AMAZON_HOST + element.select("div > span > a").attr("href");
            String bookName = element.select("div > span > a > div").text();
            Book book = new Book(bookName, author, level, price, link);
            logger.info("===receiveBook===" + book);
            books.add(book);
            if(visit != null){
                visit.accept(book);
            }
        };
        parallel(elements,elementConsumer,parallel);
        return books;
    }

    public static Queue<Category> receiveCategory(String url, final int level, int restry, Predicate<Category> predicate,Consumer<Category> visit, AtomicBoolean parallel) {
        Queue<Category> categories = new ConcurrentLinkedQueue<>();
        AtomicBoolean has = new AtomicBoolean(false);
        StringBuilder root = new StringBuilder("div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-left-col ul#zg_browseRoot");
        Elements body = getElements(getDocument(url,restry),"body");
        body.forEach( re -> {
            re.select(root.toString()).forEach( element -> {
                List<String> dirStrings = new ArrayList<>();
                Elements dirs = element.select("li + ul");
                for (int i = 0; i < dirs.size() - 1; i++) {
                    Elements e = dirs.get(i).select(">li");
                    String text = e.text();
                    if (e.select("a").size() > 0) {
                        text = e.select("a").text();
                    }
                    dirStrings.add(text);
                }

                StringBuilder innerSel = new StringBuilder("ul ul ");
                for (int i = 0; i < level; i++) {
                    innerSel.append("ul ");
                }
                innerSel.append("li a[href]");
                Elements elements = element.select(innerSel.toString());
                if (elements != null && elements.size() > 0) {
                    has.set(true);

                    Consumer<Element> childAction = li -> {
                        String href = li.attr("href");
                        String name = li.text();
                        List<String> hrefs = new ArrayList<>();
                        hrefs.add(href);
                        Elements pages = re.select("div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-right-col div#zg-center-div > div > div.a-text-center > ul li.a-normal a");
                        pages.forEach(page -> hrefs.add(page.attr("href")));
                        Category category = new Category(dirStrings, name, hrefs);
                        if(predicate != null && !predicate.test(category)){
                            logger.info("=========skip==========" + category.toString());
                            return;
                        }
                        Queue<Category> categoriesChild = receiveCategory(href, level + 1, restry, predicate, visit, parallel);
                        if (categoriesChild == null) {
                            logger.info("=========Category===========" + String.join(File.separator, dirStrings) + File.separator + name);
                            categories.add(category);
                            if(visit != null){
                                visit.accept(category);
                            }
                        }else{
                            categories.addAll(categoriesChild);
                        }
                    };
                    //2级以下才并行
                    parallel(elements,childAction,level > 2 ? parallel : new AtomicBoolean(false));
                }
            });
        });
        if(has.get()){
            return categories;
        }
        return null;
    }

    public static <T> void parallel(Collection<T> collection, Consumer<T>consumer, AtomicBoolean parallel){
        if(parallel.get()){
            ExecutorService executorService = newExecutor(collection.size());
            CompletionService completionService = new ExecutorCompletionService(executorService);
            List<Future> futures = new ArrayList<>();
            for(T t : collection){
                futures.add(completionService.submit(() -> {
                    if(parallel.get()){
                        consumer.accept(t);
                    }
                    return null;
                }));
            }
            Iterator<Future> iterator = futures.iterator();
            boolean get = true;
            Future future = null;
            while (iterator.hasNext() || get == false){
                if(get){
                    future = iterator.next();
                }
                if(parallel.get()){
                    try {
                        future.get(2000,TimeUnit.MILLISECONDS);
                        get = true;
                    } catch (InterruptedException e) {
                        get = false;
                    } catch (ExecutionException e) {
                        throw new RuntimeException(e);
                    } catch (TimeoutException e) {
                        get = false;
                    }
                }else {
                    future.cancel(true);
                    get = true;
                }
            }
            executorService.shutdownNow();
        }else {
            for(T t : collection){
                consumer.accept(t);
            }
        }
    }


    public static ExecutorService newExecutor(int corePoolSize) {
        AtomicInteger index = new AtomicInteger(0);
        return new ThreadPoolExecutor(Math.min(20,corePoolSize), Math.max(Runtime.getRuntime().availableProcessors(), 20),
                3L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<Runnable>(1000),
                (Runnable r) -> {
                    Thread a = new Thread(r);
                    a.setName("parallel" + Integer.toHexString(index.hashCode()) + " " + index.getAndIncrement());
                    return a;
                }
                , new ThreadPoolExecutor.CallerRunsPolicy());
    }

    public static void main(String[] args) {
        Consumer<Category> categoryConsumer = element -> {
            logger.info(element.toString());
            /*
            StringBuilder bookNames = new StringBuilder();
            receiveBookInPage(element.getHrefs().iterator().next(), book -> {
                bookNames.append(book.getTitle());
                bookNames.append("\n");
            }, null, 1);
            try {
                FileUtils.writeByteArrayToFile(new File(String.join(File.separator, element.getDirs()) + File.separator + element.getCategory()), bookNames.toString().getBytes(), true);
            } catch (IOException e) {
                logger.error("", e);
            }*/
        };
        Queue<Category> list = receiveCategory("https://www.amazon.cn/gp/bestsellers/digital-text/143359071/ref=zg_bs_nav_kinc_2_116169071", 3, 1, null,categoryConsumer,new AtomicBoolean(true));
    //    list.parallelStream().forEach(categoryConsumer);
        System.out.println(list);
    }
}
