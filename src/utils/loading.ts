export async function pending(promise: Promise<any>) {
  const loading = ElLoading.service({
    lock: true,
    text: 'loading',
    background: 'rgba(0, 0, 0, 0.1)',
  });
  const result = await promise;
  loading.close();
  return result;
}
