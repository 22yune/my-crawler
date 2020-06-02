package ${coPackage};

import com.alibaba.fastjson.JSON;

import java.io.Serializable;

/**

 */
public class ${coClass} extends COXCacheRoot implements Serializable {

<#list fields as field>
	/**
	 * ${field.memo}
	 */
	private   ${field.javaType} ${field.fname} ;
</#list>

<#list fields as field>

	public ${field.javaType} get${field.beanName}() {
		return ${field.fname};
	}

	public void set${ field.beanName}(${field.javaType}  ${field.fname} ) {
		this. ${field.fname}  =  ${field.fname} ;
	}
</#list>

	@Override
	public int hashCode() {
        <#list fields as field>
            <#if field?index == 0>
                int hashCode = XCacheObjectUtils.nullSafeHashCode(this.get${ field.beanName}());
                <#break>
            </#if>
            hashCode = 29 * hashCode + XCacheObjectUtils.nullSafeHashCode(this.get${ field.beanName}());
        </#list>
		hashCode = 29 * hashCode + super.hashCode();
		return hashCode;
	}

	@Override
	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof ${coClass} )) {
			return false;
		}
		${coClass} that = (${coClass} ) other;
        <#list fields as field>
            if (!XCacheObjectUtils.nullSafeEquals(this.get${field.beanName}(), that.get${ field.beanName}())){
			    return false;
             }
        </#list>
		return true;
	}

	@Override
	public String toString() {
		return JSON.toJSONString(this);
	}

}
