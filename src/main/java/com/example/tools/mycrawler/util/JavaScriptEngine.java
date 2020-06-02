package com.example.tools.mycrawler.util;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

/**
 * Created by baogen.zhang on 2020/5/28
 *
 * @author baogen.zhang
 * @date 2020/5/28
 */
public class JavaScriptEngine {

    public static String  decode(String url){
        ScriptEngine runtime = null;
        try {
            runtime = new ScriptEngineManager().getEngineByName("javascript");
            runtime.put(
                    "str",
                    "PGh0bJvZHk+PC9odG1sPg==");
            System.out.println((String)runtime.eval("window.atob(str)"));

        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }
}
