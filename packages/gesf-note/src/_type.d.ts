export interface noteInfo {
  Title: string;
  Desc: string;
  Source: string;
  Tags: string[];
  Type: string;
  Url: string;
}

export interface HttpRequestOptions {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: FormData | string;
  onload?: (res: any) => void;
  onerror?: (error: any) => void;
}

export interface INoteSite {
  noteScheme: {
    item: Partial<noteInfo>;
    btnWrap: string;
  };
  _loadCheck(): string;
  _getVideoUrl(): string;
  _getTitle(): string;
  _getDesc(): string;
  readonly note: noteInfo;
}
