// PropTypes 替代方案 - 运行时属性验证

import React from 'react';

// 基础类型验证器
export const validators = {
  string: (value, propName) => {
    if (typeof value !== 'string') {
      return `Property '${propName}' expected string, got ${typeof value}`;
    }
    return null;
  },

  number: (value, propName) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return `Property '${propName}' expected number, got ${typeof value}`;
    }
    return null;
  },

  boolean: (value, propName) => {
    if (typeof value !== 'boolean') {
      return `Property '${propName}' expected boolean, got ${typeof value}`;
    }
    return null;
  },

  function: (value, propName) => {
    if (typeof value !== 'function') {
      return `Property '${propName}' expected function, got ${typeof value}`;
    }
    return null;
  },

  object: (value, propName) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return `Property '${propName}' expected object, got ${typeof value}`;
    }
    return null;
  },

  array: (value, propName) => {
    if (!Array.isArray(value)) {
      return `Property '${propName}' expected array, got ${typeof value}`;
    }
    return null;
  },

  node: (value, propName) => {
    if (value !== null && value !== undefined && typeof value !== 'string' && typeof value !== 'number' && !React.isValidElement(value)) {
      return `Property '${propName}' expected React node, got ${typeof value}`;
    }
    return null;
  },

  element: (value, propName) => {
    if (!React.isValidElement(value)) {
      return `Property '${propName}' expected React element, got ${typeof value}`;
    }
    return null;
  }
};

// 复合验证器
export const createValidator = {
  // 必需属性
  required: (validator) => (value, propName) => {
    if (value === undefined || value === null) {
      return `Property '${propName}' is required`;
    }
    return validator(value, propName);
  },

  // 可选属性
  optional: (validator) => (value, propName) => {
    if (value === undefined || value === null) {
      return null;
    }
    return validator(value, propName);
  },

  // 枚举验证
  oneOf: (validValues) => (value, propName) => {
    if (!validValues.includes(value)) {
      return `Property '${propName}' expected one of [${validValues.join(', ')}], got '${value}'`;
    }
    return null;
  },

  // 类型联合
  oneOfType: (validators) => (value, propName) => {
    const errors = validators.map(validator => validator(value, propName)).filter(Boolean);
    if (errors.length === validators.length) {
      return `Property '${propName}' failed all type validations`;
    }
    return null;
  },

  // 数组元素类型验证
  arrayOf: (elementValidator) => (value, propName) => {
    const arrayError = validators.array(value, propName);
    if (arrayError) return arrayError;

    for (let i = 0; i < value.length; i++) {
      const elementError = elementValidator(value[i], `${propName}[${i}]`);
      if (elementError) return elementError;
    }
    return null;
  },

  // 对象形状验证
  shape: (schema) => (value, propName) => {
    const objectError = validators.object(value, propName);
    if (objectError) return objectError;

    for (const key in schema) {
      const validator = schema[key];
      const error = validator(value[key], `${propName}.${key}`);
      if (error) return error;
    }
    return null;
  },

  // 精确对象验证
  exact: (schema) => (value, propName) => {
    const objectError = validators.object(value, propName);
    if (objectError) return objectError;

    // 检查多余的属性
    const extraKeys = Object.keys(value).filter(key => !(key in schema));
    if (extraKeys.length > 0) {
      return `Property '${propName}' has unexpected keys: ${extraKeys.join(', ')}`;
    }

    // 检查每个属性
    for (const key in schema) {
      const validator = schema[key];
      const error = validator(value[key], `${propName}.${key}`);
      if (error) return error;
    }
    return null;
  },

  // 最小值验证
  min: (minValue) => (value, propName) => {
    if (typeof value === 'number' && value < minValue) {
      return `Property '${propName}' expected minimum ${minValue}, got ${value}`;
    }
    if (Array.isArray(value) && value.length < minValue) {
      return `Property '${propName}' expected minimum length ${minValue}, got ${value.length}`;
    }
    if (typeof value === 'string' && value.length < minValue) {
      return `Property '${propName}' expected minimum length ${minValue}, got ${value.length}`;
    }
    return null;
  },

  // 最大值验证
  max: (maxValue) => (value, propName) => {
    if (typeof value === 'number' && value > maxValue) {
      return `Property '${propName}' expected maximum ${maxValue}, got ${value}`;
    }
    if (Array.isArray(value) && value.length > maxValue) {
      return `Property '${propName}' expected maximum length ${maxValue}, got ${value.length}`;
    }
    if (typeof value === 'string' && value.length > maxValue) {
      return `Property '${propName}' expected maximum length ${maxValue}, got ${value.length}`;
    }
    return null;
  },

  // 自定义验证器
  custom: (validatorFn) => (value, propName) => {
    try {
      const result = validatorFn(value);
      if (result === true || result === undefined || result === null) {
        return null;
      }
      return typeof result === 'string' ? result : `Property '${propName}' failed custom validation`;
    } catch (error) {
      return `Property '${propName}' validation error: ${error.message}`;
    }
  }
};

// 组件属性验证HOC
export const withPropValidation = (Component, propTypes) => {
  return React.forwardRef((props, ref) => {
    if (process.env.NODE_ENV !== 'development') {
      return React.createElement(Component, { ...props, ref });
    }

    // 验证props
    const errors = [];
    Object.keys(propTypes).forEach(propName => {
      const validator = propTypes[propName];
      const error = validator(props[propName], propName);
      if (error) {
        errors.push(error);
      }
    });

    // 输出错误
    if (errors.length > 0) {
      console.group(`❌ PropTypes validation failed for ${Component.displayName || Component.name}`);
      errors.forEach(error => console.error(error));
      console.groupEnd();
    }

    return React.createElement(Component, { ...props, ref });
  });
};

// 快捷验证函数
export const PropTypes = {
  string: validators.string,
  number: validators.number,
  boolean: validators.boolean,
  function: validators.function,
  object: validators.object,
  array: validators.array,
  node: validators.node,
  element: validators.element,

  // 可选类型
  optionalString: createValidator.optional(validators.string),
  optionalNumber: createValidator.optional(validators.number),
  optionalBoolean: createValidator.optional(validators.boolean),
  optionalFunction: createValidator.optional(validators.function),
  optionalObject: createValidator.optional(validators.object),
  optionalArray: createValidator.optional(validators.array),
  optionalNode: createValidator.optional(validators.node),
  optionalElement: createValidator.optional(validators.element),

  // 工厂函数
  isRequired: createValidator.required,
  oneOf: createValidator.oneOf,
  oneOfType: createValidator.oneOfType,
  arrayOf: createValidator.arrayOf,
  shape: createValidator.shape,
  exact: createValidator.exact,
  min: createValidator.min,
  max: createValidator.max,
  custom: createValidator.custom
};

// 使用示例
export const examplePropTypes = {
  // 基础类型
  title: PropTypes.string,
  count: PropTypes.number,
  isVisible: PropTypes.boolean,
  onClick: PropTypes.function,

  // 必需属性
  id: PropTypes.isRequired(PropTypes.string),

  // 枚举
  size: PropTypes.oneOf(['small', 'medium', 'large']),

  // 数组
  items: PropTypes.arrayOf(PropTypes.string),

  // 对象形状
  user: PropTypes.shape({
    name: PropTypes.isRequired(PropTypes.string),
    age: PropTypes.optionalNumber,
    email: PropTypes.optionalString
  }),

  // 自定义验证
  email: PropTypes.custom(value => {
    if (typeof value !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  })
};

export default PropTypes;