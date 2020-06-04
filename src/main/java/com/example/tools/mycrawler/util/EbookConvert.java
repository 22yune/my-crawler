package com.example.tools.mycrawler.util;

import java.io.*;
import java.util.Arrays;
import java.util.List;

/**
 * 转换recipe
 *
 * Created by baogen.zhang on 2020/5/26
 *
 * @author baogen.zhang
 * @date 2020/5/26
 */
public class EbookConvert {

    /**
     * 调用本地方法  本地应安装calibre
     * 执行命令：ebook-convert a.recipe a.mobi --output-profile kindle_oasiss
     */
    public static void ebookConvert(String recipeName, String dir){
        String[] commond = new String[]{"ebook-convert",recipeName + ".recipe", ".mobi","--mobi-file-type=new",/*"--mobi-keep-original-images",*/"--output-profile=kindle_oasis","--pretty-print","--duplicate-links-in-toc","--level1-toc=//h:h1","--level2-toc=//h:h21","--level3-toc=//h:h3"};
        try {
        //    Process process =Runtime.getRuntime().exec("ebook-convert " + recipeName + ".recipe .mobi  --mobi-keep-original-images --pretty-print --mobi-file-type=new  --output-profile=kindle_oasis --duplicate-links-in-toc --level1-toc=//h:h1 --level2-toc=//h:h21 --level3-toc=//h:h3 > " + recipeName + ".log",null,new File(dir));
            ProcessBuilder builder = new ProcessBuilder(commond).directory(new File(dir)).redirectOutput( ProcessBuilder.Redirect.to(new File(dir ,recipeName + ".log"))).redirectError(ProcessBuilder.Redirect.to(new File(dir ,recipeName + "error.log")));
            Process process = builder.start();
            try {
                readInputStream(process.getErrorStream(),process.getInputStream());
                int i = process.waitFor();
                System.out.println(i);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public static void readInputStream(InputStream... inputStreams){
        for (InputStream in : inputStreams){
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));
            String line;
            try{
                while ((line = reader.readLine()) != null){
                    System.out.println(line);
                }
            }catch (IOException e) {
                e.printStackTrace();
            }

        }
    }

}
