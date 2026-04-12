import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

export function notification(
  title,
  message,
  type = "success",
  dangerouslyUseHTMLString = true,
) {
  ElNotification({
    title: title,
    message: message,
    dangerouslyUseHTMLString: dangerouslyUseHTMLString,
    type: type,
  });
}

export function messageBox(
  message,
  title = "警告",
  type = "warning",
  showCancelButton = true,
) {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: type,
    showCancelButton: showCancelButton,
  });
}

export function message(message, type = "success") {
  return ElMessage({
    message: message,
    type: type,
  });
}
