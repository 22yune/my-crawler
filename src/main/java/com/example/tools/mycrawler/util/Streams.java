package com.example.tools.mycrawler.util;

import lombok.AllArgsConstructor;

import java.util.*;
import java.util.function.*;
import java.util.stream.*;

/**
 * @author yi_jing
 * @date 2021-12-29
 */
@AllArgsConstructor
public class Streams<T> implements Stream<T> {
    private Stream<T> stream;

    public static <L>  Streams<L> stream(Collection<L> list){
        return new Streams<>(Optional.ofNullable(list).orElse(Collections.emptyList()).stream());
    }

    @Override
    public Streams<T> filter(Predicate<? super T> predicate) {
        return new Streams<>(stream.filter(predicate));
    }

    @Override
    public <R> Streams<R> map(Function<? super T, ? extends R> mapper) {
        return new Streams<>(stream.map(mapper));
    }

    @Override
    public IntStream mapToInt(ToIntFunction<? super T> mapper) {
        return stream.mapToInt(mapper);
    }

    @Override
    public LongStream mapToLong(ToLongFunction<? super T> mapper) {
        return stream.mapToLong(mapper);
    }

    @Override
    public DoubleStream mapToDouble(ToDoubleFunction<? super T> mapper) {
        return stream.mapToDouble(mapper);
    }

    @Override
    public <R> Streams<R> flatMap(Function<? super T, ? extends Stream<? extends R>> mapper) {
        return new Streams<>(stream.flatMap(mapper));
    }

    @Override
    public IntStream flatMapToInt(Function<? super T, ? extends IntStream> mapper) {
        return stream.flatMapToInt(mapper);
    }

    @Override
    public LongStream flatMapToLong(Function<? super T, ? extends LongStream> mapper) {
        return stream.flatMapToLong(mapper);
    }

    @Override
    public DoubleStream flatMapToDouble(Function<? super T, ? extends DoubleStream> mapper) {
        return stream.flatMapToDouble(mapper);
    }

    @Override
    public Streams<T> distinct() {
        return new Streams<>(stream.distinct());
    }

    @Override
    public Streams<T> sorted() {
        return new Streams<>(stream.sorted());
    }

    @Override
    public Streams<T> sorted(Comparator<? super T> comparator) {
        return new Streams<>(stream.sorted(comparator));
    }

    @Override
    public Streams<T> peek(Consumer<? super T> action) {
        return new Streams<>(stream.peek(action));
    }

    @Override
    public Streams<T> limit(long maxSize) {
        return new Streams<>(stream.limit(maxSize));
    }

    @Override
    public Streams<T> skip(long n) {
        return new Streams<>(stream.skip(n));
    }

    @Override
    public void forEach(Consumer<? super T> action) {
        stream.forEach(action);
    }

    @Override
    public void forEachOrdered(Consumer<? super T> action) {
        stream.forEachOrdered(action);
    }

    @Override
    public Object[] toArray() {
        return stream.toArray();
    }

    @Override
    public <A> A[] toArray(IntFunction<A[]> generator) {
        return stream.toArray(generator);
    }

    @Override
    public T reduce(T identity, BinaryOperator<T> accumulator) {
        return stream.reduce(identity, accumulator);
    }

    @Override
    public Optional<T> reduce(BinaryOperator<T> accumulator) {
        return stream.reduce(accumulator);
    }

    @Override
    public <U> U reduce(U identity, BiFunction<U, ? super T, U> accumulator, BinaryOperator<U> combiner) {
        return stream.reduce(identity, accumulator, combiner);
    }

    @Override
    public <R> R collect(Supplier<R> supplier, BiConsumer<R, ? super T> accumulator, BiConsumer<R, R> combiner) {
        return stream.collect(supplier, accumulator, combiner);
    }

    @Override
    public <R, A> R collect(Collector<? super T, A, R> collector) {
        return stream.collect(collector);
    }

    @Override
    public Optional<T> min(Comparator<? super T> comparator) {
        return stream.min(comparator);
    }

    @Override
    public Optional<T> max(Comparator<? super T> comparator) {
        return stream.max(comparator);
    }

    @Override
    public long count() {
        return stream.count();
    }

    @Override
    public boolean anyMatch(Predicate<? super T> predicate) {
        return stream.anyMatch(predicate);
    }

    @Override
    public boolean allMatch(Predicate<? super T> predicate) {
        return stream.allMatch(predicate);
    }

    @Override
    public boolean noneMatch(Predicate<? super T> predicate) {
        return stream.noneMatch(predicate);
    }

    @Override
    public Optional<T> findFirst() {
        return stream.findFirst();
    }

    @Override
    public Optional<T> findAny() {
        return stream.findAny();
    }

    @Override
    public Iterator<T> iterator() {
        return stream.iterator();
    }

    @Override
    public Spliterator<T> spliterator() {
        return stream.spliterator();
    }

    @Override
    public boolean isParallel() {
        return stream.isParallel();
    }

    @Override
    public Stream<T> sequential() {
        return stream.sequential();
    }

    @Override
    public Stream<T> parallel() {
        return stream.parallel();
    }

    @Override
    public Stream<T> unordered() {
        return stream.unordered();
    }

    @Override
    public Stream<T> onClose(Runnable closeHandler) {
        return stream.onClose(closeHandler);
    }

    @Override
    public void close() {
        stream.close();
    }

    public <R> Streams<R> mapNotNull(Function<? super T, ? extends R> mapper) {
        return new Streams<R>(stream.map(mapper)).filter(Objects::nonNull);
    }

    public Set<T> toSet(){
        return stream.collect(Collectors.toSet());
    }
    public List<T> toList(){
        return stream.collect(Collectors.toList());
    }
    public <K,R> Map<K,R> toMap(Function<T,K> keyMapping, Function<T,R> valueMapping){
        return toMap(keyMapping, valueMapping, (a,b) -> b);
    }
    public <K,R> Map<K,R> toMap(Function<T,K> keyMapping, Function<T,R> valueMapping, BinaryOperator<R> mergeFunction){
        return stream.filter(e -> valueMapping.apply(e) != null).collect(Collectors.toMap(keyMapping, valueMapping, mergeFunction));
    }
    public <K> Map<K,List<T>> groupingBy(Function<T,K> key){
        return groupingBy(key, Function.identity());
    }
    public <K,R> Map<K,List<R>> groupingBy(Function<T,K> key, Function<T,R> value){
        return stream.collect(Collectors.groupingBy(key,Collectors.mapping(value,Collectors.toList())));
    }
    public <R> R findFirst(Function<T, R> mapping) {
        return stream.findFirst().map(mapping).orElse(null);
    }
}
