package com.example.tools.mycrawler;

/**
 * Created by baogen.zhang on 2019/5/13
 *
 * @author baogen.zhang
 * @date 2019/5/13
 */
public class Utils {

    public static void forEachYearMonth(int startYear, int startMonth, int endYear, int endMonth, YearMonth runnable) throws Exception {
        for (int year = startYear; year <= endYear; year++) {
            for (int month = 1; month <= 12; month++) {
                if ((year == startYear && month < startMonth) || (year == endYear && month > endMonth)) {
                    continue;
                } else {
                    runnable.run(year, month);
                }
            }
        }
    }

    public interface YearMonth {
        void run(int year, int month) throws Exception;
    }
}
