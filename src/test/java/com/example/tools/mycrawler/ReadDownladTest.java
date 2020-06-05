package com.example.tools.mycrawler;

import com.example.tools.mycrawler.util.FreemarkerUtil;
import freemarker.template.Template;
import org.junit.Test;

/**
 * Created by baogen.zhang on 2020/6/4
 *
 * @author baogen.zhang
 * @date 2020/6/4
 */
public class ReadDownladTest {

    @Test
    public void test(){
        Template template = FreemarkerUtil.getTemplate("epubeeReaderRecipe.ftl");
        System.out.println(template);
    }
}
