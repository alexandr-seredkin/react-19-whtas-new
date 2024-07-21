'use client'

import { Suspense, use } from 'react'
import { getTodo } from '../../uitls/getTodo'
import Loader from '../../components/Loader'

// Берем главный компонент
const TodoWidget = () => {
  return (
    <Suspense fallback={<Loader />}>
      {/* в нём оборачиваем в Suspense 
       компонент внутри которого будет 
       использоваться получение данных 
       через use() */}
      <TodoItem todo_id={1} />
    </Suspense>
  )
}

const TodoItem = ({ todo_id }) => {
  // Передаем запрос на получение TODO
  // И не как callback, а сразу вызываем
  const data = use(getTodo(todo_id))
  return <>{data.title}</>
}

export { TodoWidget }
