import { http } from "./_http";

function http_git_headers(token: string = "", other: Record<string, string> = {}): Record<string, string> {
  return {
    "Accept": "application/vnd.github+json",
    "Authorization": "token " + token,
    ...other
  };
}

function http_git_check(res_data: any): { error: boolean; message?: string; data: any } {
  let error_message = "";
  if (typeof res_data === "object" && res_data !== null && "status" in res_data) {
    if (res_data.status !== 200) {
      error_message = res_data.message || "未知错误";
    }
  }

  if (error_message !== "") {
    return { error: true, message: error_message, data: res_data };
  }

  return { error: false, data: res_data };
}

// 获取 GitHub issues 列表
export async function http_git_issues(labels: string = "pick", repo: string = "", token: string = ""): Promise<any> {
  const url = `https://api.github.com/repos/${repo}/issues?labels=${labels}`;
  const headers = http_git_headers(token);
  const response: any = await http.get(url, headers);
  const responseData = JSON.parse(response.responseText);
  return http_git_check(responseData);
}

// 创建 GitHub issue 评论
export async function http_git_create_comment(comments_url: string, comment: string, token: string): Promise<any> {
  const headers = http_git_headers(token);
  const data = { body: comment };
  const response: any = await http.post(comments_url, data, headers);
  const responseData = JSON.parse(response.responseText);
  return http_git_check(responseData);
}
