package com.example.tools.mycrawler.util;

import lombok.extern.slf4j.Slf4j;

import java.util.Random;
import java.util.concurrent.Callable;

/**
 * @author yi_jing
 * @date 2022-06-19
 */
@Slf4j
public class CommonUtil {

    public static <T> T doRetry( int restry, Callable<T> runnable){
        if (restry <= 0) {
            return null;
        }
        try {
            return runnable.call();
        } catch (Exception e) {
            try {
                Thread.sleep(new Random().nextInt(1000));
            } catch (InterruptedException ignored) {}
            if (restry <= 1) {
                log.error("=====", e);
                return null;
            }
            return doRetry( restry - 1, runnable);
        }
    }
}
