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
public class EpubeeCrawlerNew {
    private static Logger logger = LoggerFactory.getLogger(EpubeeCrawlerNew.class);

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

    public static void crawlerAmazon(String url, Predicate< Category> predicate, final int level , AtomicBoolean parallel) {
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
                parallel.set(false);
            } catch (Exception e) {

            }
        }).start();

        Supplier<String> tErr = () -> {
            if (!isRuning.get()) {
                throw new RuntimeException("end");
            }
            return "";
        };


        Map<String, Set<String>> allNameMap = new ConcurrentHashMap<>();
        Map<String, StringJoiner> allBookInfoMap = new ConcurrentHashMap<>();
        Map<String, StringJoiner> allNoBookInfoMap = new ConcurrentHashMap<>();
        Function<String, Set<String>> getNameSet = bigCate -> {
            if (allNameMap.get(bigCate) == null) {
                allNameMap.putIfAbsent(bigCate, new ConcurrentSkipListSet<>());
            }
            return allNameMap.get(bigCate);
        };
        Function<String, StringJoiner> getAllBookInfo = bigCate -> {
            if (allBookInfoMap.get(bigCate) == null) {
                allBookInfoMap.putIfAbsent(bigCate, new StringJoiner("\n"));
            }
            return allBookInfoMap.get(bigCate);
        };
        Function<String, StringJoiner> getAllNoBookInfo = bigCate -> {
            if (allNoBookInfoMap.get(bigCate) == null) {
                allNoBookInfoMap.putIfAbsent(bigCate, new StringJoiner("\n"));
            }
            return allNoBookInfoMap.get(bigCate);
        };

        Consumer<Category> categoryConsumer = element -> {
            String bigCate = String.join(File.separator, element.getDirs());

            Set<String> bookNames = getNameSet.apply(bigCate);
            StringJoiner allBookInfos = getAllBookInfo.apply(bigCate);
            StringJoiner allNoBookInfos = getAllNoBookInfo.apply(bigCate);

            if (predicate != null && !predicate.test(element)) {
                logger.info("skip  " + element.toString());
                return;
            }else {
                logger.info(element.toString());
            }
            StringJoiner booksInfo = new StringJoiner("\n");
            StringJoiner noBooksInfo = new StringJoiner("\n");
            StringJoiner err = new StringJoiner("\n");

            Consumer<Book> bookConsumer = book -> {
                tErr.get();
                if (bookNames.contains(book.getTitle())) {
                    logger.info("已读取: " + book.getTitle());
                    return;
                }
                long time = System.currentTimeMillis();
                List<Book> bookList = GetBook.getDownloadUrl(userContext, book.getTitle(), bookNames,tErr);
                logger.info( "查询时长" + (System.currentTimeMillis() - time) + "   " + book.getTitle() );
                if (bookList == null) {
                    noBooksInfo.add(book.toString());
                    noBooksInfo.add(book.getReadUrl());
                    allNoBookInfos.add(book.toString());
                    allNoBookInfos.add(book.getReadUrl());
                    count.getAndIncrement();
                    logger.info("未找到： " + book.getTitle());
                    return;
                }
                for (Book b : bookList) {
                    b.copyInfo(book);
                    booksInfo.add(b.toString());
                    allBookInfos.add(b.toString());
                    logger.info("读取:  " + b.toString());
                }
            };

            try {
                for (String href : element.getHrefs()) {
                    tErr.get();
                    AmazonVisit.receiveBookInPage(href, bookConsumer, parallel,1);
                }
            } catch (Exception e) {
                err.add(element.toString());
                err.add("访问异常" + e.getMessage());
                logger.error(element.toString(), e);
            }
            String baseName = getBaseDir(element);
            save(baseName + "all.txt", booksInfo.toString());
            save(baseName + "noFind.txt", noBooksInfo.toString());
            save(baseName + "error.txt", err.toString());
        };
        try {
             AmazonVisit.receiveCategory(url, level,1,predicate,categoryConsumer , parallel);
        } catch (Exception e) {
            logger.info("end", e);
        } finally {
            ((ConcurrentHashMap<String, StringJoiner>) allBookInfoMap).forEach(allBookInfoMap.size(), (dir, bookInfos) -> {
                StringJoiner joiner = new StringJoiner(File.separator);
                joiner.add(getRootDir());
                joiner.add(dir);
                joiner.add("allFind.txt");
                save(joiner.toString(), bookInfos.toString());
            });
            ((ConcurrentHashMap<String, StringJoiner>) allNoBookInfoMap).forEach(allNoBookInfoMap.size(), (dir, bookInfos) -> {
                StringJoiner joiner = new StringJoiner(File.separator);
                joiner.add(getRootDir());
                joiner.add(dir);
                joiner.add("allNoFind.txt");
                save(joiner.toString(), bookInfos.toString());
            });
            isRuning.set(false);
            parallel.set(false);
        }
    }

    private static void save(String path, String data) {
        try {
            logger.info("文件保存" + path + ".size:" + data.length());
            if(data.length() == 0){
                return;
            }
            FileUtils.writeByteArrayToFile(new File(path), data.getBytes(), false);
        } catch (IOException e) {
            logger.error("文件保存异常" + path, e);
        }
    }

    public static String getBaseDir(Category category){
        return getRootDir() + File.separator + String.join(File.separator, category.getDirs()) + File.separator + category.getCategory() + File.separator;
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
        String bookName = "深入理解Java虚拟机：JVM高级特性与最佳实践（第3版）";
        List<Book> books = GetBook4Recipe.getDownloadUrl(new UserContext(), bookName, new HashSet<>() ,null,true);
        System.out.println(books);
        Scanner scanner = new Scanner(System.in);

        while (true){
            System.out.println("input===" );
            String s = scanner.next();
            System.out.println("===" + s);
            if(s.equals("e")){
                break;
            }else if(s.equals("a")){
                for (Book book : books){
                    ReadDownload.downLoad(book,"E:\\LEVELB\\sideProject\\recipes\\epubee");
                }
                break;
            }else {
                try{
                    ReadDownload.downLoad(books.get(Integer.valueOf(s)),"E:\\LEVELB\\sideProject\\recipes\\epubee");
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        }

    }
}
