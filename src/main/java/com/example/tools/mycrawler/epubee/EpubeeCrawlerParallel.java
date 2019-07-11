package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.amazon.Category;
import com.example.tools.mycrawler.support.AmazonVisitParallel;
import com.example.tools.mycrawler.support.VisitUtil;
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
@Deprecated
public class EpubeeCrawlerParallel {
    private static Logger logger = LoggerFactory.getLogger(EpubeeCrawlerParallel.class);

    public static String epubeeFolder;

    private static AtomicInteger index = new AtomicInteger(0);
    public static final ExecutorService executor = new ThreadPoolExecutor(1, Math.max(Runtime.getRuntime().availableProcessors(), 15) ,
            3L, TimeUnit.MINUTES,
            new LinkedBlockingQueue<Runnable>(10000),
            new ThreadFactory() {
                @Override
                public Thread newThread(Runnable r) {
                    return new Thread(r, "visit" + index.getAndIncrement());
                }
            }, new ThreadPoolExecutor.CallerRunsPolicy());
    private static AtomicInteger saveIndex = new AtomicInteger(0);
    public static final ExecutorService saveExecutor = new ThreadPoolExecutor(1, Math.max(Runtime.getRuntime().availableProcessors(), 15) ,
            3L, TimeUnit.MINUTES,
            new LinkedBlockingQueue<Runnable>(10000),
            new ThreadFactory() {
                @Override
                public Thread newThread(Runnable r) {
                    return new Thread(r, "save" + saveIndex.getAndIncrement());
                }
            }, new ThreadPoolExecutor.CallerRunsPolicy());


    public static Predicate<Category> startWrap(Predicate<Category> predicate) {
        AtomicBoolean start = new AtomicBoolean(true);
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

    public static void crawlerAmazon(String url, Predicate<AmazonVisitParallel.Category> predicate, final int level ) {
        crawlerAmazon(url, predicate, level,executor);
    }
    public static void crawlerAmazon(String url, Predicate<AmazonVisitParallel.Category> predicate, final int level, ExecutorService executorService) {
        UserContext userContext = new UserContext();
        AtomicInteger count = new AtomicInteger(0);

        AtomicBoolean isRuning = new AtomicBoolean(true);
        AtomicReference<AmazonVisitParallel.Category> nowCate = new AtomicReference<>();
        new Thread() {
            @Override
            public void run() {
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
                        sleep(10000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                try {
                    FileUtils.writeByteArrayToFile(new File(getRootDir() + File.separator + "now.txt"), nowCate.toString().getBytes(), true);
                } catch (IOException e) {
                    logger.error("文件保存异常now", e);
                }
            }
        }.start();

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

        Map<String, Set<String>> allNameMap = new ConcurrentHashMap<>();
        Map<String, StringJoiner> allBookInfoMap = new ConcurrentHashMap<>();
        Map<String, AtomicInteger> allCountMap = new ConcurrentHashMap<>();
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
        Function<String, AtomicInteger> getCount = bigCate -> {
            if (allCountMap.get(bigCate) == null) {
                allCountMap.putIfAbsent(bigCate, new AtomicInteger());
            }
            return allCountMap.get(bigCate);
        };

        try {
            AmazonVisitParallel.visitCategory(url, level, element -> {
                String bigCate = String.join(File.separator, element.getDirs());
                Set<String> bookNames = getNameSet.apply(bigCate);
                StringJoiner allBookInfos = getAllBookInfo.apply(bigCate);
                AtomicInteger cateCount = getCount.apply(bigCate);
                cateCount.getAndIncrement();

                if (predicate != null && !predicate.test(element)) {
                    logger.info("skip  " + element.toString());
                    return;
                }
                logger.info(element.toString());
                StringJoiner booksInfo = new StringJoiner("\n");
                StringJoiner noBooksInfo = new StringJoiner("\n");
                StringBuilder err = new StringBuilder();
                try {
                    for (String href : element.getHrefs()) {
                        tErr.get();
                        AmazonVisitParallel.visitPage(href, book -> {
                            tErr.get();
                            if (bookNames.contains(book.getTitle())) {
                                logger.info("已读取: " + book.getTitle());
                                return;
                            }
                            List<Book> bookList = getDownloadUrl(userContext, book.getTitle(), bookNames);
                            if (bookList == null) {
                                noBooksInfo.add(book.toString());
                                noBooksInfo.add(book.getReadUrl());
                                logger.info("未找到： " + book.getTitle());
                            }
                            for (Book b : bookList) {
                                b.copyInfo(book);
                                booksInfo.add(b.toString());
                                allBookInfos.add(book.toString());
                                logger.info("读取:  " + b.toString());
                            }
                            cateCount.decrementAndGet();
                        }, new AbstractExecutorService() {
                            @Override
                            public Future<?> submit(Runnable task) {
                                cateCount.getAndIncrement();
                                return executorService.submit(task);
                            }

                            @Override
                            public void shutdown() {
                                executorService.shutdown();
                            }

                            @Override
                            public List<Runnable> shutdownNow() {
                                return executorService.shutdownNow();
                            }

                            @Override
                            public boolean isShutdown() {
                                return executorService.isShutdown();
                            }

                            @Override
                            public boolean isTerminated() {
                                return executorService.isTerminated();
                            }

                            @Override
                            public boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException {
                                return executorService.awaitTermination(timeout, unit);
                            }

                            @Override
                            public void execute(Runnable command) {
                                executorService.execute(command);
                            }
                        }, 1);
                    }
                } catch (Exception e) {
                    err.append(element.toString());
                    err.append("\n");
                    err.append("访问异常" + e.getMessage());
                    err.append("\n");
                    logger.error(element.toString(), e);
                }
                String baseName = getRootDir() + File.separator + String.join(File.separator, element.getDirs()) + File.separator + element.getCategory() + File.separator;
                VisitUtil.submit("", a -> {
                    while (isRuning.get() && cateCount.get() != 0){
                        try {
                            Thread.sleep(10000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                    save(baseName + "all.txt", booksInfo.toString());
                    save(baseName + "noFind.txt", noBooksInfo.toString());
                    save(baseName + "error.txt", err.toString());
                },saveExecutor);
                cateCount.decrementAndGet();
            }, executorService, 1);
        } catch (Exception e) {
            logger.info("end", e);
        } finally {
            new Thread(){
                @Override
                public void run() {
                    int noCount = 0;
                    while (isRuning.get()){
                        boolean has = false;
                        for(Map.Entry<String,AtomicInteger> set : allCountMap.entrySet()){
                            if(0 != set.getValue().get() ){
                                has = true;
                                break;
                            }
                        }
                        if(!has){
                            noCount++;
                        }else {
                            noCount = 0;
                        }
                        if(noCount > 10){
                            isRuning.set(false);
                        }
                        try {
                            sleep(10000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                    if (executorService != null) {
                        executorService.shutdown();
                    }
                    ((ConcurrentHashMap<String, StringJoiner>) allBookInfoMap).forEach(allBookInfoMap.size(), (dir, bookUrls) -> {
                        StringJoiner joiner = new StringJoiner(File.separator);
                        joiner.add(getRootDir());
                        joiner.add(dir);
                        joiner.add("allBigCategory.txt");
                        save(joiner.toString(), bookUrls.toString() );
                    });
                }
            }.start();
        }
    }

    private static void save(String path, String data) {
        try {
            FileUtils.writeByteArrayToFile(new File(path), data.getBytes(), true);
        } catch (IOException e) {
            logger.error("文件保存异常" + path, e);
        }
    }

    public static List<Book> getDownloadUrl(UserContext user, String bookName, Set<String> bookNames) {
        if (bookName == null || bookName.length() == 0) {
            return Collections.EMPTY_LIST;
        }
        List<Book> books = null;
        try {
            books = QueryBook.queryBook(bookName);
        } catch (TimeoutException e) {
            return getDownloadUrl(user, bookName, bookNames);
        }
        if (books == null || books.size() == 0) {
            int index = bookName.lastIndexOf("（");
            int index2 = bookName.lastIndexOf("(");
            index = Math.max(index, index2);
            if (index > 1) {
                return getDownloadUrl(user, bookName.substring(0, index), bookNames);
            }
            return Collections.EMPTY_LIST;
        }
        Iterator<Book> iter = books.iterator();
        boolean success = false;
        int retry = 0;
        Book book = null;
        List<Book> result = new ArrayList<>();
        while (iter.hasNext()) {
            if (book == null) {
                book = iter.next();
            }
            if (success == true) {
                book = iter.next();
                retry = 1;
            } else {
                retry++;
            }
            if (bookNames.contains(book.getTitle())) {
                success = true;
                continue;
            }
            boolean add = false;
            try {
                add = AddBook.addBook(book, user);
            } catch (TimeoutException e) {

            }
            if (add) {
                List<Book> myBooks = null;
                try {
                    myBooks = MyBook.myBook(user);
                } catch (TimeoutException e) {
                    e.printStackTrace();
                }
                for (Book myBook : myBooks) {
                    if (book.getTitle().equals(myBook.getTitle())) {
                        String location = null;
                        try {
                            location = ReadBook.readBook(myBook.getReadUrl(), user);
                        } catch (TimeoutException e) {
                            break;
                        }
                        book.setReadUrl(myBook.getReadUrl());
                        book.setDownLoadUrl(location);
                        bookNames.add(book.getTitle());
                        result.add(book);
                        success = true;
                        break;
                    }
                }
            } else {
                success = false;
            }

            if (retry > 3) {
                success = true;
            }
            try {
                user.used();
            } catch (TimeoutException e) {
            }
        }
        return result;
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
        String bookName = "迷茫的旅行商：一个无处不在的计算机算法问题 (图灵新知 10)";
        List<Book> books = getDownloadUrl(new UserContext(), bookName, new HashSet<>());
        System.out.println(books);
    }
}
