package com.example.tools.mycrawler.library;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.util.Md5Util;
import com.example.tools.mycrawler.util.Streams;
import com.google.common.hash.BloomFilter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * @author yi_jing
 * @date 2022-07-06
 */
@Slf4j
public class BookLibrary {
    private String metaFilePath = "bookInfo/library";
    private Set<String> md5Set;
    private Set<String> nameSet;

    public BookLibrary(String metaFilePath) {
        this.metaFilePath = metaFilePath;
        Set<BookMeta> list = Streams.stream(load(metaFilePath)).map(e -> JSON.parseObject(e,BookMeta.class)).toSet();
        md5Set = Streams.stream(list).map(BookMeta::getMd5).toSet();
        nameSet = Streams.stream(list).map(BookMeta::getName).toSet();
    }

    public static void main(String[] args){

    }

    public boolean nameContain(String name){
        return nameSet.contains(name);
    }

    public boolean md5Contain(String md5){
        return md5Set.contains(md5);
    }

    public void addStore(String dir){
        Set<BookMeta> setNew = fileStream(dir).map(e -> {
            String name = e.getName();
            if(nameSet.contains(name)){
                return null;
            }
            String md5 = Md5Util.getFileMD5(e);
            if(md5Set.contains(md5)){
                return null;
            }
            nameSet.add(name);
            md5Set.add(md5);
            return new BookMeta(name,md5);
        }).filter(Objects::nonNull).collect(Collectors.toSet());
        save(metaFilePath,Streams.stream(setNew).map(JSON::toJSONString).toList(), true);
    }

    private static Stream<File> fileStream(String path){
        try {
            return FileUtils.streamFiles(new File(path),true, Arrays.stream(Type.values()).map(t -> "." + t.name()).toArray(String[]::new));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Stream.empty();
    }
    private static void save(String path,List<String> vs,boolean apppend) {
        try {
            log.info("文件" + (apppend? "追加到" : "保存到") + path );
            FileUtils.writeLines(new File(path), vs, apppend);
        } catch (IOException e) {
            log.error("文件保存异常" + path, e);
        }
    }
    private static List<String> load(String path){
        try {
            return FileUtils.readLines(new File(path), Charset.defaultCharset());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Collections.emptyList();
    }
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookMeta{
        private String name;
        private String md5;
    }

    public enum Type{
        AZW3,MOBI,EPUB,ZIP,PDF,OTHER;
        public static Integer indexName(String v){
            return index(v.substring(v.lastIndexOf(".") + 1).trim());
        }
        public static Integer index(String v){
            try{
                return valueOf(v.toUpperCase()).ordinal();
            }catch (Exception e){
                return OTHER.ordinal();
            }
        }
    }
}
