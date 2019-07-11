package com.example.tools.mycrawler.support;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.util.Random;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;

/**
 * Created by baogen.zhang on 2019/6/25
 *
 * @author baogen.zhang
 * @date 2019/6/25
 */
@Deprecated
public class VisitUtil {


    public static void visit(String url, String select, Consumer<Element> visit, ExecutorService executorService, int restry) {
        if (restry <= 0) {
            return;
        }
        try {
            String html = Jsoup.connect(url).get().outerHtml();
            visitByHtml(html, select, visit, executorService);
        } catch (IOException e) {
            try {
                Thread.sleep(new Random().nextInt(2000));
            } catch (InterruptedException e1) {
            }
            if (restry < 1) {
                e.printStackTrace();
                return;
            }
            visit(url, select, visit, executorService, restry - 1);
        }
    }

    public static void visitByHtml(String html, String select, Consumer<Element> visit, ExecutorService executorService) {
        Document listPage = Jsoup.parse(html);
        Elements links = listPage.select(select);
        links.forEach(e -> submit(e, visit, executorService));
    }

    public static <T> void submit(T e, Consumer<T> consumer, ExecutorService executorService) {
        if (executorService != null) {
            executorService.submit(new Runnable() {
                @Override
                public void run() {
                    consumer.accept(e);
                }
            });
        } else {
            consumer.accept(e);
        }
    }

}
