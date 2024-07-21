const url = 'https://jsonplaceholder.typicode.com'

// Получение TODO
export const getTodo = (id) =>
  fetch(`${url}/todos/${id}`).then((response) => response.json())

// Получение списка TODO
export const getTodos = () =>
  fetch(`${url}/todos/`).then((response) => response.json())
