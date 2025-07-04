import { Environment } from "../../src/env/environment";
import { Value } from "../../src/values/value";
import { Field } from "../../src/field";

const TitleIds: any = {
    '标题1': 'fld1',
    '标题2': 'fld2',
    '标题3': 'fld3',
    '标题4': 'fld4',
    '标题5': 'fld5',
    '标题6': 'fld6',
    '标题7': 'fld7',
    '标题8': 'fld8',
    '标题9': 'fld9',
    '标题10': 'fld10',
}

function getFieldId(title: string): string {
    return TitleIds[title];
}

/**
 * CustomEnvironment是一个自定义的环境类
 * 它继承自Environment类，并实现了相关方法，表达式在执行时会通过get方法获取变量的值，并通过set方法设置变量的值。
 * 如果表达式中的变量和实际值之间是间接关联的，则可以在get/set方法中进行处理。
 */
export class CustomEnvironment extends Environment {
    private dataValues: any = {
        'fld1': 2,
        'fld2': 3,
        'fld3': 4,
        'fld4': 5,
        'fld5': 6,
        'fld6': 2,
        'fld7': 3,
        'fld8': 4,
        'fld9': 5,
        'fld10': 6
    }
    constructor(private readonly formId: string) {
        super();
    }

    /**
     * 在执行表达式前，表达式中用到的所有变量都会传递进此方法中，业务上可以提前批量准备好数据，
     * 例如从数据库中查询数据等，避免每个变量都单独查询时的性能问题。
     * 如果返回false，则不会执行表达式。
     * @param vars 表达式中用到的变量列表
     * @returns true表示可以执行表达式，false表示不执行表达式
     */
    beforeExecute(vars: Field[]): boolean {
        return true;
    }

    get(id: string): Value | undefined {
        return this.getOrDefault(id, new Value());
    }

    getOrDefault(title: string, defValue: Value): Value {
        const id: string = getFieldId(title);
        const v: number = this.dataValues[id];
        if (v !== undefined) {
            return new Value(v);
        }
        return defValue;
    }

    putValue(title: string, value: Value): void {
        const id: string = getFieldId(title);
        this.dataValues[id] = value.asInteger();
    }

    size(): number {
        return 10;
    }
}