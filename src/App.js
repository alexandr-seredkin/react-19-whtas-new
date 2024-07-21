import { FromAction, FromActionAsync } from './REACT_19/formActions/FromAction'
import { TodoWidget } from './REACT_19/use/use_GetData'

const App = () => {
  return (
    <div>
      
      {/* Тест use для получения данных */}
      {/* <TodoWidget /> */}

      {/* Тест действия формы */}
      <FromAction />

      {/* Тест действия формы с хуком useFromStatus */}
      {/* для полчения состояния загрузки асинхронной формы */}
      <FromActionAsync />


    </div>
  )
}

export default App
