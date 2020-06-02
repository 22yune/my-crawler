package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.util.EbookConvert;
import com.example.tools.mycrawler.util.FreemarkerUtil;

import java.io.File;
import java.util.Map;

/**
 * Created by baogen.zhang on 2020/5/28
 *
 * @author baogen.zhang
 * @date 2020/5/28
 */
public class ReadDownload {
    /**
     * 从epubee图书阅读地址生成recipe，从recipe生成mobi
     */
    public static void downLoad(Book book,String dir){
        String fileName = book.getBid();
        FreemarkerUtil.fprint("epubeeReaderRecipe.ftl",book,dir + File.separator+ fileName + ".recipe");
        EbookConvert.ebookConvert(fileName,dir);
    }

}
