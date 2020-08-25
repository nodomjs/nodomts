declare namespace nodom {
    /**
     * 异常处理类
     * @since       1.0.0
     */
    class NodomError extends Error {
        constructor(errorName: string, p1?: string, p2?: string, p3?: string, p4?: string);
    }
}
