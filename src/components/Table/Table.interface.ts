export enum TableColumnType
{
    MultipleUsers = 'multipleUsers',
    Icon = 'icon'
}

export interface TableConfig
{
    title: string;
    key: string;
    type?: 'multipleUsers' | 'icon';
}