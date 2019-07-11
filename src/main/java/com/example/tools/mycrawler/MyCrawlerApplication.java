package com.example.tools.mycrawler;

import com.example.tools.mycrawler.epubee.EpubeeCrawler;
import com.example.tools.mycrawler.epubee.EpubeeCrawlerNew;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

@SpringBootApplication
public class MyCrawlerApplication implements CommandLineRunner {


    @Value("${crawlStorageFolder}")
    private String crawlStorageFolder;

    @Value("${epubeeFolder}")
    private String epubeeFolder;

    @Value("${name:ee}")
    private String name;

    @Value("${XCacheDataInitProvider4AcctTree.tables:TTRD_INSTRUMENT,TTRD_P_TYPE}")
    private Set<String> tables;

    public static void main(String[] args) {
        SpringApplication.run(MyCrawlerApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {

        int startYear = 2017;
        int endYear = 2019;
        int startMonth = 11;
        int endMonth = 4;
        MeBookCrawlerByJsoup.crawlStorageFolder = crawlStorageFolder;
        EpubeeCrawler.epubeeFolder = epubeeFolder;
        EpubeeCrawlerNew.epubeeFolder = epubeeFolder;
        /*MeBookCrawlerByJsoup.crawlerYearMonth(2017,12);
        MeBookCrawlerByJsoup.crawlerYearMonth(2018,5);
        MeBookCrawlerByJsoup.crawlerYearMonth(2018,9);
        MeBookCrawlerByJsoup.crawlerYearMonth(2018,11);*/
        //   MeBookCrawlerByJsoup.crawlerYearMonth(2018,12);
        //   MeBookCrawlerByJsoup.crawlerTerm(startYear,startMonth,endYear,endMonth);
        //    Utils.forEachYearMonth(startYear,startMonth,endYear,endMonth,MeBookCrawlerByJsoup::crawlerYearMonth);
        //   MeBookCrawlerByJsoup.crawlerListPage("zygf22-77.txt","http://mebook.cc/category/hjzy/gfzy/","page/%s",22,77);
        //   MeBookCrawlerByJsoup.crawlerListPage("jgwxl1-6.txt","http://mebook.cc/category/hjzy/jgwxl/","page/%s",1,6);
        //    MeBookCrawlerByJsoup.crawlerListPage("qthj1-38.txt","http://mebook.cc/category/hjzy/qita/","page/%s",1,66);
        /*MeBookCrawlerByJsoup.crawlerListPage("","中亚官方合集资源下载.txt","http://mebook.cc/category/hjzy/gfzy/","page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","人物传记·旅行见闻.txt","http://mebook.cc/category/cxxs/lvxzj","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","美工设计.txt","http://mebook.cc/category/gjs/mgsj","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","理想国译丛.txt","http://mebook.cc/category/hjzy/lxgyc","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","甲骨文系列丛书.txt","http://mebook.cc/category/hjzy/jgwxl","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","科幻悬疑·恐怖惊悚.txt","http://mebook.cc/category/cxxs/khkb","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","官场商战·人生百态.txt","http://mebook.cc/category/cxxs/gcsz","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","都市言情·体育竞技.txt","http://mebook.cc/category/jpwlxs/dsyq","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","office办公.txt","http://mebook.cc/category/gjs/bg","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","多看专区.txt","http://mebook.cc/category/duokan","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","漫画.txt","http://mebook.cc/category/kdmh","/page/%s",1,0);
        MeBookCrawlerByJsoup.crawlerListPage("","轻小说.txt","http://mebook.cc/category/qxs","/page/%s",1,0);*/
        //    MeBookCrawlerByJsoup.crawlerListPage("","杂志·期刊.txt","http://mebook.cc/category/zzqk","/page/%s",1,0);
        //    MeBookCrawlerByJsoup.crawlerAllSite();

        //    EpubeeCrawler.getDownloadUrl(new UserContext(),"Linux");

    /*    EpubeeCrawler.crawlerAmazon("https://www.amazon.cn/gp/bestsellers/digital-text/143359071/ref=zg_bs_nav_kinc_2_116169071", EpubeeCrawler.startWrap(e -> true), 3);
        EpubeeCrawler.crawlerAmazon("https://www.amazon.cn/gp/bestsellers/digital-text/ref=zg_bs_unv_kinc_1_143359071_2", e -> {
            return e.getCategory().contains("经济管理") || e.getCategory().contains("英语与其他外语") || EpubeeCrawler.startWrap(ee -> ee.getCategory().contains("计算机与互联网") || ee.getDirs().contains("计算机与互联网")).test(e);
        }, 1);*/


        /*EpubeeCrawlerNew.crawlerAmazon("https://www.amazon.cn/gp/bestsellers/digital-text/143359071/ref=zg_bs_nav_kinc_2_116169071", EpubeeCrawler.startWrap(e -> true), 3,new AtomicBoolean(true));*/
        /*EpubeeCrawlerNew.crawlerAmazon("https://www.amazon.cn/gp/bestsellers/digital-text/143231071/ref=zg_bs_nav_kinc_2_116169071", EpubeeCrawler.startWrap(e -> true), 3,new AtomicBoolean(true));*/

/*
        EpubeeCrawlerNew.crawlerAmazon("https://www.amazon.cn/gp/bestsellers/digital-text/ref=zg_bs_unv_kinc_1_143359071_2",
                e -> {
                    if (e.getDirs().size() >= 3) {
                        String level3 = e.getDirs().get(2);
                        return level3.contains("经济管理")
                                || level3.contains("文学")
                                || level3.contains("励志与成功")
                                || level3.contains("小说")
                                || level3.contains("传记")
                                || level3.contains("社会科学")
                                || level3.contains("法律")
                                || level3.contains("心理学")
                                || level3.contains("历史")
                                || level3.contains("国学")
                                || level3.contains("哲学与宗教")
                                || level3.contains("政治与军事")
                                || level3.contains("科技")
                                || level3.contains("医学")
                                || level3.contains("科学与自然");
                    }
                    return true;
                }, 1, new AtomicBoolean(true));*/

        EpubeeCrawlerNew.crawlerAmazon("https://www.amazon.cn/gp/bestsellers/digital-text/116169071/ref=zg_bs_nav_kinc_1_kinc",
                e -> {
                    String level3;
                    if (e.getDirs().size() >= 3) {
                        level3 = e.getDirs().get(2);
                    }else if(e.getDirs().size() == 2){
                        level3 = e.getCategory();
                    }else {
                        level3 = "";
                    }

                    return level3.contains("娱乐")
                            || level3.contains("英语与其他外语")
                            || level3.contains("心理学")
                            || level3.contains("婚恋与两性");
                }, 2, new AtomicBoolean(true));

    }
}
