package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.amazon.AmazonVisit;
import com.example.tools.mycrawler.amazon.Category;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

/**
 * Created by baogen.zhang on 2019/4/28
 *
 * @author baogen.zhang
 * @date 2019/4/28
 */
@Component
public class EpubeeCrawler {
    private static Logger logger = LoggerFactory.getLogger(EpubeeCrawler.class);

    public static String epubeeFolder;


    public static Predicate< Category> startWrap(Predicate< Category> predicate) {
        AtomicBoolean start = new AtomicBoolean(false);
        return e -> {
            if (!start.get()) {
                if (predicate.test(e)) {
                    start.set(true);
                } else {
                    return false;
                }
            }
            return true;
        };
    }

    public static void crawlerAmazon(String url, Predicate< Category> predicate, final int level ) {
        UserContext userContext = new UserContext();
        AtomicInteger count = new AtomicInteger(0);
        AtomicReference< Category> nowCate = new AtomicReference<>();

        AtomicBoolean isRuning = new AtomicBoolean(true);
        
        new Thread(() -> {
                long startTime = System.currentTimeMillis(); //每隔1s读一次数据
                int total = count.get();
                while (isRuning.get()) {
                    if (count.get() - total > 10) {
                        total = count.get();
                        long timeMillis = System.currentTimeMillis() - startTime;
                        long speed = timeMillis / total;
                        logger.info("平均下载速率： " + timeMillis + " / " + total + " = " + speed);
                    }
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                try {
                    FileUtils.writeByteArrayToFile(new File(getRootDir() + File.separator + "now.txt"), nowCate.toString().getBytes(), true);
                } catch (IOException e) {
                    logger.error("文件保存异常now", e);
                }
            }).start();

        new Thread(() -> {
            try {
                int read = new BufferedReader(new InputStreamReader(System.in)).read();
                while (isRuning.get() && read != 10) {
                    read = new BufferedReader(new InputStreamReader(System.in)).read();
                }
                isRuning.set(false);
            } catch (Exception e) {

            }
        }).start();

        Supplier<String> tErr = () -> {
            if (!isRuning.get()) {
                throw new RuntimeException("end");
            }
            return "";
        };

        Set<String> bookNames = new HashSet<>();
        Set<String> bookUrls = new HashSet<>();


        Consumer<Category> categoryConsumer = element -> {
            String bigCate = String.join(File.separator, element.getDirs());
            String bigCateNow = nowCate.get() == null ? "" : String.join(File.separator, nowCate.get().getDirs());
            if(!bigCate.equals(bigCateNow)){
                if(bigCateNow.length() > 0){
                    StringJoiner joiner = new StringJoiner(File.separator);
                    joiner.add(getRootDir());
                    joiner.add(bigCateNow);
                    joiner.add("allBigCategory.txt");
                    save(joiner.toString(), String.join("\n", bookUrls) );
                }
                bookNames.clear();
                bookUrls.clear();
            }
            nowCate.set(element);

            if (predicate != null && !predicate.test(element)) {
                logger.info("skip  " + element.toString());
                return;
            }
            logger.info(element.toString());
            StringBuilder booksInfo = new StringBuilder();
            StringBuilder nobooksInfo = new StringBuilder();
            StringBuilder downLoadUrls = new StringBuilder();
            StringBuilder err = new StringBuilder();

            Consumer<Book> bookConsumer = book -> {
                tErr.get();
                if (bookNames.contains(book.getTitle())) {
                    logger.info("已读取: " + book.getTitle());
                    return;
                }
                List<Book> bookList = GetBook.getDownloadUrl(userContext, book.getTitle(), bookNames);
                for (Book b : bookList) {
                    b.copyInfo(book);
                    booksInfo.append(b.toString());
                    booksInfo.append("\n");
                    downLoadUrls.append(b.getDownLoadUrl());
                    downLoadUrls.append("\n");
                    bookUrls.add(b.getDownLoadUrl());
                    count.getAndIncrement();
                    logger.info("读取:  " + b.toString());
                }
                if (bookList.size() == 0) {
                    nobooksInfo.append(book.toString());
                    nobooksInfo.append("\n");
                    logger.info("未找到： " + book.getTitle());
                }
            };

            try {
                for (String href : element.getHrefs()) {
                    tErr.get();
                    AmazonVisit.receiveBookInPage(href, bookConsumer, new AtomicBoolean(false),1);
                }
            } catch (Exception e) {
                err.append(element.toString());
                err.append("\n");
                err.append("访问异常" + e.getMessage());
                err.append("\n");
                logger.error(element.toString(), e);
            }
            String baseName = getRootDir() + File.separator + String.join(File.separator, element.getDirs()) + File.separator + element.getCategory() + File.separator;
            save(baseName + "all.txt", booksInfo.toString());
            save(baseName + "download.txt", downLoadUrls.toString());
            save(baseName + "noFind.txt", nobooksInfo.toString());
            save(baseName + "error.txt", err.toString());
        };
        try {
             AmazonVisit.receiveCategory(url, level,1,null,categoryConsumer , new AtomicBoolean(false));
        } catch (Exception e) {
            logger.info("end", e);
        } finally {
            isRuning.set(false);
        }
    }

    private static void save(String path, String data) {
        try {
            FileUtils.writeByteArrayToFile(new File(path), data.getBytes(), true);
        } catch (IOException e) {
            logger.error("文件保存异常" + path, e);
        }
    }


    public static String getRootDir() {
        String dateFormat = "yyyy-MM-dd";
        String folder = epubeeFolder;
        if (dateFormat != null && dateFormat.length() > 0) {
            SimpleDateFormat sdf = new SimpleDateFormat();// 格式化时间
            sdf.applyPattern(dateFormat);
            String data = sdf.format(new Date());
            folder += File.separator + data;
        }
        return folder;
    }


    public static void main(String[] args) {
        String bookName = "快速阅读";
        List<Book> books = GetBook.getDownloadUrl(new UserContext(), bookName, new HashSet<>());
        System.out.println(books);
    }
}
