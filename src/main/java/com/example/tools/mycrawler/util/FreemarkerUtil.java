package com.example.tools.mycrawler.util;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * Created by baogen.zhang on 2018/12/28
 *
 * @author baogen.zhang
 * @date 2018/12/28
 */
public class FreemarkerUtil {
    private static Configuration configuration;
    private static String TEMPLECLASSPATH = "/ftl";

    public static Configuration getConfiguration() {
        if(configuration == null){
            // 通过Freemaker的Configuration读取相应的ftl
            Configuration cfg = new Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS);
            // 设定去哪里读取相应的ftl模板文件
            cfg.setClassForTemplateLoading(FreemarkerUtil.class, TEMPLECLASSPATH);
            cfg.setDefaultEncoding("UTF-8");
            cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
            configuration = cfg;
        }
        return configuration;
    }

    public static Template getTemplate(String name) {
        try {
            // 在模板文件目录中找到名称为name的文件
            Template temp = getConfiguration().getTemplate(name);
            return temp;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 控制台输出
     *
     * @param name
     * @param root
     */
    public static void print(String name, Map<String, Object> root) {
        try {
            // 通过Template可以将模板文件输出到相应的流
            Template temp = getTemplate(name);
            temp.process(root, new PrintWriter(System.out));
        } catch (TemplateException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 输出HTML文件
     *
     * @param name 模板名称
     * @param root
     * @param outFile
     */
    public static void fprint(String name, Object root, String outFile) {
        FileWriter out = null;
        try {
            // 通过一个文件输出流，就可以写到相应的文件中，此处用的是绝对路径
            File targetFile = new File( outFile);
            File parentDir = targetFile.getParentFile();
            if (!parentDir.exists()) {
                parentDir.mkdirs();
            }
            out = new FileWriter(targetFile);
            Template temp = getTemplate(name);
            temp.process(root, out);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (TemplateException e) {
            e.printStackTrace();
        } finally {
            try {
                if (out != null){
                    out.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}