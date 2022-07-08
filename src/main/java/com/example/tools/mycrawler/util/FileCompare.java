package com.example.tools.mycrawler.util;

import java.io.*;

public class FileCompare {
    public static void main(String[] args) {
        System.out.println("请依次输入两个文件的全路径和文件名：");
        System.out.println("firstFile:");
        String firstFile = "/Volumes/android/Books/tianlang-lanzou/Z Guo Jing Ji Wen Ti Cong S - Wen Yu Yuan.azw3";
        System.out.println("secondFile:");
        String secondFile = "/Volumes/android/l4/中国经济问题丛书精选（套装共13册.azw3";
        FileCompare.compareFile(firstFile, secondFile);
    }

    public static void compareFile(String firFile, String secFile) {
        try {
            BufferedInputStream fir = new BufferedInputStream(new FileInputStream(firFile));
            BufferedInputStream sec = new BufferedInputStream(new FileInputStream(secFile));

            int a ,b;
            int length = 0;
            while ((a = fir.read()) != -1 && (b = sec.read()) != -1) {
                if (a != b) {
                    System.out.println("Files not same!" + length);
                    break;
                }
                length++;
            }
            System.out.println("two files are same!");
            fir.close();
            sec.close();
            return;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String inputFileName() {
        BufferedReader buffRead = new BufferedReader(new InputStreamReader(System.in));
        String fileName = null;
        try {
            fileName = buffRead.readLine();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return fileName;
    }
}