package com.example.tools.mycrawler.epubee;

import java.util.*;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Supplier;

/**
 * Created by baogen.zhang on 2019/7/2
 *
 * @author baogen.zhang
 * @date 2019/7/2
 */
public class GetBook {


    public static List<Book> getDownloadUrl(UserContext user, String bookName, Set<String> bookNames) {
        return getDownloadUrl(user, bookName, bookNames,null);
    }
    public static List<Book> getDownloadUrl(UserContext user, String bookName, Set<String> bookNames, Supplier<String> tErr) {
        if (bookName == null || bookName.length() == 0) {
            return Collections.EMPTY_LIST;
        }

        if(tErr != null){
            tErr.get();
        }
        List<Book> books = null;
        try {
            books = QueryBook.queryBook(bookName);
        } catch (TimeoutException e) {
            if(tErr != null){
                tErr.get();
            }
            try {
                Thread.sleep(new Random().nextInt(20000));
            } catch (InterruptedException e1) {
             //   e1.printStackTrace();
            }
            return getDownloadUrl(user, bookName, bookNames,tErr);
        }
        if (books == null || books.size() == 0) {
            int index = bookName.lastIndexOf("（");
            int index2 = bookName.lastIndexOf("(");
            index = Math.max(index, index2);
            if (index > 1) {
                return getDownloadUrl(user, bookName.substring(0, index).replace("——"," "), bookNames,tErr);
            }
            return null;
        }
        Iterator<Book> iter = books.iterator();
        boolean success = true;
        int retry = 0;
        Book book = null;
        List<Book> result = new ArrayList<>();
        while (iter.hasNext() || success == false) {
            if(tErr != null){
                tErr.get();
            }
            if (success == true) {
                book = iter.next();
                retry = 1;
            } else {
                retry++;
                try {
                    Thread.sleep(new Random().nextInt(10000));
                } catch (InterruptedException e) {
                    //   e.printStackTrace();
                }
            }
            if(tErr != null){
                tErr.get();
            }
            if (bookNames.contains(book.getTitle())) {
                success = true;
                continue;
            }
            boolean add = false;
            try {
                add = AddBook.addBook(book, user);
            } catch (TimeoutException e) {
            }

            if (add) {
                try {
                    List<Book> myBooks = MyBook.myBook(user);
                    for (Book myBook : myBooks) {
                        if(tErr != null){
                            tErr.get();
                        }
                        if (book.getTitle().equals(myBook.getTitle())) {
                            String location = null;
                            try {
                                location = ReadBook.readBook(myBook.getReadUrl(), user);
                            } catch (TimeoutException e) {
                                break;
                            }
                            book.setReadUrl(myBook.getReadUrl());
                            book.setDownLoadUrl(location);
                            book.setSize(myBook.getSize());
                            bookNames.add(book.getTitle());
                            result.add(book);
                            success = true;
                            break;
                        }
                    }
                } catch (TimeoutException e) {
                    success = false;
                }
            } else {
                success = false;
            }

            if (retry > 3) {
                success = true;
            }
            try {
                user.used();
            } catch (TimeoutException e) {
            }
        }
        return result;
    }
}
