export class StringUtils {
    public static clean(str: string | null | undefined): string {
        return str == null ? "" : str.trim();
    }

    public static trim(str: string | null | undefined): string | null {
        return str == null ? null : str.trim();
    }

    public static isNotEmpty(str: string | null | undefined): boolean {
        return str != null && str.length > 0;
    }

    public static isEmpty(str: string | null | undefined): boolean {
        return str == null || str.length === 0;
    }

    public static isBlank(str: string | null | undefined): boolean {
        return str == null || str.trim().length === 0;
    }

    public static isNotBlank(str: string | null | undefined): boolean {
        return !StringUtils.isBlank(str);
    }

    public static equals(str1: string | null | undefined, str2: string | null | undefined): boolean {
        if (str1 == null) {
            return str2 == null;
        }
        return str1 === str2;
    }

    public static equalsIgnoreCase(str1: string | null | undefined, str2: string | null | undefined): boolean {
        if (str1 == null) {
            return str2 == null;
        }
        if (str2 == null) return false;
        return str1.toLowerCase() === str2.toLowerCase();
    }
}