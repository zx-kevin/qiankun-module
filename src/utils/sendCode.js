export const useSendCode = () => {
  // 定义定时器初始值为0
  const timer = ref(0);
  // 倒计时内容
  let countdown = ref('发送验证码');
  // 定义定时器id 为了清除定时器
  let timerId = null;
  const clearCountdown = () => {
    clearInterval(timerId);
    countdown.value = '发送验证码';
  };
  // 之后页面调用send方法来使用
  const openCountdown = () => {
    // 第二次点击 大于0时 直接 return
    if (timer.value > 0) return;
    // 赋值倒计时
    timer.value = 60;
    // 如果之前id存在可清除
    if (timerId) clearInterval(timerId);
    // 赋值定时器id
    countdown.value = `${timer.value}秒`;
    timerId = setInterval(() => {
      // 时间-1
      timer.value--;
      countdown.value = `${timer.value}秒`;
      // 倒计时结束 清除定时器
      if (timer.value == 0) clearCountdown();
    }, 1000);
  };

  onMounted(() => {
    clearCountdown;
  });
  return { countdown, openCountdown };
};
