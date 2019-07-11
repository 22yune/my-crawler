package com.example.tools.mycrawler.support;

import com.example.tools.mycrawler.amazon.Category;
import com.example.tools.mycrawler.epubee.Book;
import org.apache.commons.io.FileUtils;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;

/**
 * Created by baogen.zhang on 2019/6/25
 *
 * @author baogen.zhang
 * @date 2019/6/25
 */
@Deprecated
public class AmazonVisit {
    private static Logger logger = LoggerFactory.getLogger(AmazonVisit.class);

    private static final String AMAZON_HOST = "https://www.amazon.cn";

    public static void visitPage(String url, Consumer<Book> visit, int restry) {
        String select = "div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-right-col div#zg-center-div ol#zg-ordered-list li.zg-item-immersion span.a-list-item";
        VisitUtil.visit(url, select, element -> {
            String price = element.select("div > span > div > a > span.a-color-price span").text();
            String author = element.select("div > span > div > span.a-color-base").text();
            String level = element.select("div > span > div > a > i > span").text();
            String link = AMAZON_HOST + element.select("div > span > a").attr("href");
            String bookName = element.select("div > span > a > div").text();
            logger.info("===BookName===" + bookName);
            visit.accept(new Book(bookName, author, level, price, link));
        }, null, restry);
    }

    public static boolean visitCategory(String url, final int level, Consumer<Category> visit, int restry) {
        AtomicBoolean has = new AtomicBoolean(false);
        StringBuilder root = new StringBuilder("div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-left-col ul#zg_browseRoot");
        VisitUtil.visit(url, "body", re -> {
            re.select(root.toString()).forEach(oe -> VisitUtil.submit(oe, element -> {
                List<String> category = new ArrayList<>();
                Elements dirs = element.select("li + ul");
                for (int i = 0; i < dirs.size() - 1; i++) {
                    Elements e = dirs.get(i).select(">li");
                    String text = e.text();
                    if (e.select("a").size() > 0) {
                        text = e.select("a").text();
                    }
                    category.add(text);
                }

                StringBuilder innerSel = new StringBuilder("ul ul ");
                for (int i = 0; i < level; i++) {
                    innerSel.append("ul ");
                }
                innerSel.append("li a[href]");
                Elements elements = element.select(innerSel.toString());
                if (elements != null && elements.size() > 0) {
                    has.set(true);
                    elements.forEach(oli -> VisitUtil.submit(oli, li -> {
                        String href = li.attr("href");
                        String name = li.text();
                        boolean visited = visitCategory(href, level + 1, visit, restry);
                        if (!visited) {
                            logger.info("=========Category===========" + String.join(File.separator, category) + File.separator + name);

                            List<String> hrefs = new ArrayList<>();
                            hrefs.add(href);

                            Elements pages = re.select("div#a-page div#zg div.a-fixed-left-flipped-grid div.a-fixed-left-grid-inner div#zg-right-col div#zg-center-div > div > div.a-text-center > ul li.a-normal a");
                            pages.forEach(page -> hrefs.add(page.attr("href")));

                            visit.accept(new Category(category, name, hrefs));
                        }
                    }, null));
                }
            }, null));
        }, null, restry);
        return has.get();
    }


    public static void main(String[] args) {
        visitCategory("https://www.amazon.cn/gp/bestsellers/digital-text/143359071/ref=zg_bs_nav_kinc_2_116169071", 3, element -> {
            logger.info(element.toString());
            StringBuilder bookNames = new StringBuilder();
            visitPage(element.getHrefs().iterator().next(), book -> {
                bookNames.append(book.getTitle());
                bookNames.append("\n");
            }, 1);
            try {
                FileUtils.writeByteArrayToFile(new File(String.join(File.separator, element.getDirs()) + File.separator + element.getCategory()), bookNames.toString().getBytes(), true);
            } catch (IOException e) {
                logger.error("", e);
            }
        }, 1);
    }
}
