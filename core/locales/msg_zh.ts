/*
 * 消息js文件 中文文件
 */
namespace nodom{
	/**
	 * 提示单词
	 */
	export const TipWords={
		application:"应用",
		system:"系统",
		module:"模块",
		moduleClass:'模块类',
		model:"模型",
		directive:"指令",
		directiveType:"指令类型",
		expression:"表达式",
		event:"事件",
		method:"方法",
		filter:"过滤器",
		filterType:"过滤器类型",
		data:"数据",
		dataItem:'数据项',
		route:'路由',
		routeView:'路由容器',
		plugin:'插件',
		resource:'资源',
		root:'根'
	}
	/**
	 * 异常信息
	 */
	export const ErrorMsgs={
		unknown:"未知错误",
		paramException:"{0}'{1}'方法参数错误，请参考api",
		invoke:"{0}方法调用参数{1}必须为{2}",
		invoke1:"{0}方法调用参数{1}必须为{2}或{3}",
		invoke2:"{0}方法调用参数{1}或{2}必须为{3}",
		invoke3:"{0}方法调用参数{1}不能为空",
		exist:"{0}已存在",
		exist1:"{0}'{1}'已存在",
		notexist:"{0}不存在",
		notexist1:"{0}'{1}'不存在",
		notupd:"{0}不可修改",
		notremove:"{0}不可删除",
		notremove1:"{0}{1}不可删除",
		namedinvalid:"{0}{1}命名错误，请参考用户手册对应命名规范",
		initial:"{0}初始化参数错误",
		jsonparse:"JSON解析错误",
		timeout:"请求超时",
		config:"{1}配置参数错误"
	}

	/**
	 * 表单信息
	 */
	export const FormMsgs={
		type:"请输入有效的{0}",
		unknown:"输入错误",
		required:"不能为空",
		min:"最小输入值为{0}",
		max:"最大输入值为{0}"
	}
}
