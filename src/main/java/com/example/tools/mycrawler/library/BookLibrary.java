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
    private static final String defaultMetaFilePath = "bookInfo/library.txt";
    private final String metaFilePath;
    private final Set<String> md5Set;
    private final Set<String> nameSet;

    public BookLibrary() {
        this(defaultMetaFilePath);
    }
    public BookLibrary(String metaFilePath) {
        this.metaFilePath = metaFilePath;
        Set<BookMeta> list = Streams.stream(load(metaFilePath)).map(e -> JSON.parseObject(e,BookMeta.class)).toSet();
        md5Set = Streams.stream(list).map(BookMeta::getMd5).toSet();
        nameSet = Streams.stream(list).map(BookMeta::getName).toSet();
    }

    public static void main(String[] args){
        BookLibrary library = new BookLibrary(defaultMetaFilePath);
      //  library.addStore("/Volumes/android/Books");//Untitled
        library.remove("bookInfo/library.txtdupMd5");
        library.remove("bookInfo/library.txtdupName");
    }

    public void remove(String path){
        List<String> a = new ArrayList<>();
        load(path).forEach(e -> {
            BookMeta b = JSON.parseObject(e,BookMeta.class);
            if(md5Contain(b.getMd5()) || nameContain(b.getName())){
                log.warn("delete {}, {}",e, new File(b.getPath()).delete());
            }else {
                a.add(e);
            }
        });
        log.info("[{}}]", JSON.toJSONString(a));
    }

    public boolean nameContain(String name){
        return nameSet.contains(name);
    }

    public boolean md5Contain(String md5){
        return md5Set.contains(md5);
    }

    public void addStore(String dir){
        List<String> dupNameFile = new ArrayList<>();
        dupNameFile.add(dir);
        List<String> dupMd5File = new ArrayList<>();
        dupNameFile.add(dir);
        Set<String> setNew = fileStream(dir).map(e -> {
            String md5 = Md5Util.getFileMD5(e);
            String name = e.getName();
            BookMeta meta = new BookMeta(name,md5,e.getAbsolutePath());
            String s = JSON.toJSONString(meta);
            if(!md5Set.add(md5)){
                dupMd5File.add(s);
                return null;
            }
            if(!nameSet.add(name)){
                dupNameFile.add(s);
                return null;
            }
            return s;
        }).filter(Objects::nonNull).collect(Collectors.toSet());
        log.info("end size new{} md5 {} name {}", setNew.size(), dupMd5File.size(), dupNameFile.size());
        save(metaFilePath, new ArrayList<>(setNew) , true);
        save(metaFilePath+ "dupName",dupNameFile, true);
        save(metaFilePath+ "dupMd5",dupMd5File, true);
    }

    public void addFile(File e){
        String md5 = Md5Util.getFileMD5(e);
        String name = e.getName();
        BookMeta meta = new BookMeta(name,md5,e.getAbsolutePath());
        if(!md5Set.add(md5)){
            save(metaFilePath+ "dupMd5",Collections.singletonList(JSON.toJSONString(meta)), true);
            log.warn("delete {}, {}", e.getAbsolutePath(), e.delete());
        }else if(!nameSet.add(name)){
            save(metaFilePath+ "dupName", Collections.singletonList(JSON.toJSONString(meta)), true);
        }else {
            save(metaFilePath, Collections.singletonList(JSON.toJSONString(meta)), true);
        }
    }

    private static Stream<File> fileStream(String path){
        try {
            return FileUtils.streamFiles(new File(path),true, null);
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
        private String path;
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
