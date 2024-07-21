# Репозиторий для тестирования React 19

Этот репозиторий создан для тестирования и ознакомления с функциональностью React 19. Он служит песочницей для экспериментов с новыми функциями, улучшениями и изменениями, представленными в React 19.

### Цели

- Понять новые функции и улучшения в React 19.
- Протестировать производительность и поведение компонентов React 19.
- Документировать результаты и делиться выводами с сообществом.

### Использование

Этот репозиторий предназначен для разработчиков, которые хотят получить практический и теоретический опыт с React 19.

### Изменения

- [React API - use](#use)
- [React Compiler](#react-compiler)
- [Уход от forwardRef](#уход-от-forwardref)
- [Form Actions](#form-actions)
- [useActionState](#useactionstate)
- [useFormStatus](#useformstatus)


## `USE`

> [!Кратко] > `use` - это не хук, это React API, он принимает context или Promise. Он помогает избежать нагромождений с useEffect, useState и лишними перерендарами при запросе к серверу и более гибко обращаться с context'ом

#### Потоковая передача данных

```jsx
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
```

#### Чтение контекста

Когда [контекст](https://react.dev/learn/passing-data-deeply-with-context) передается `use`, это работает аналогично [`useContext`](https://react.dev/reference/react/useContext). Пока `useContext` должен быть вызван на верхнем уровне вашего компонента, `use` можно вызывать внутри условных операторов, например `if` и циклы типа `for`. `use` предпочтительнее `useContext` потому что он более гибкий.

```jsx
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext)
    return <hr className={theme} />
  }
  return false
}
```

#### Обработка ошибок

Перехват ошибок и загрузки промиса

```jsx
<ErrorBoundary fallback={<p>Что-то пошло не так</p>}>
  <Suspense fallback={<p>Загрузка...</p>}>
    <Message messagePromise={messagePromise} />
  </Suspense>
</ErrorBoundary>
```

## React Compiler

#### Описание

Компилятор React автоматически оптимизирует ваш код, применяя мемоизацию к компонентам и хукам, что уменьшает необходимость повторных вычислений при неизменности входных данных. Он отслеживает нарушения правил и автоматически исправляет их, пропуская только проблемные участки. Если ваш код уже хорошо оптимизирован, прирост производительности может быть минимальным, но компилятор помогает справляться с трудными задачами мемоизации.

#### Оптимизация повторного рендеринга

Когда состояние компонента изменяется, React перерисовывает этот компонент и все его дочерние элементы, если не использовать `useMemo()`, `useCallback()`, или `React.memo()`. Например, в коде ниже `<MessageButton>` будет перерисовываться каждый раз, когда изменяется состояние `<FriendList>`:

```js
function FriendList({ friends }) {
  const onlineCount = useFriendOnlineCount()
  if (friends.length === 0) {
    return <NoFriends />
  }
  return (
    <div>
      <span>{onlineCount} online</span>
      {friends.map((friend) => (
        <FriendListCard key={friend.id} friend={friend} />
      ))}
      <MessageButton />
    </div>
  )
}
```

Компилятор React автоматически применяет эквивалент ручного запоминания, гарантируя, что только соответствующие части приложения будут повторно отображаться при изменении состояния, что иногда называют «мелкозернистой реактивностью».

#### **Как React Compiler это оптимизирует:**

- **`<FriendListCard />`**: Если список друзей (`friends`) изменяется, React может определить, что JSX, возвращаемый `<FriendListCard />`, может быть повторно использован, если сам компонент `<FriendListCard>` не изменился. Это значит, что React избегает создания нового JSX для этих карточек и их повторного рендеринга, если их пропсы не изменились.
- **`<MessageButton>`**: Благодаря оптимизациям React Compiler, он может обновлять её при необходимости.

#### Дорогие расчеты также запоминаются

Компилятор также может автоматически запоминать для второго варианта использования:

```js
// **Не** мемоизировано компилятором React, так как это не компонент или хук
function expensivelyProcessAReallyLargeArrayOfObjects() {
  /* ... */
}

// Мемоизировано компилятором React, так как это компонент
function TableContainer({ items }) {
  // Этот вызов функции будет мемоизирован:
  const data = expensivelyProcessAReallyLargeArrayOfObjects(items)
  // ...
}
```

Однако, если `expensivelyProcessAReallyLargeArrayOfObjects` действительно дорогая функция, вы можете рассмотреть возможность реализации собственной мемоизации вне React, потому что:

- Компилятор React запоминает только компоненты и хуки React, а не все функции.
- Мемоизация React Compiler не используется несколькими компонентами или хуками.

#### **Рекомендации:**

- **Вне React:** Для дорогих вычислений рекомендуется реализовывать собственную мемоизацию. Это означает, что вы можете использовать внешние библиотеки или написать собственное решение для мемоизации результатов функции.

- **Профилирование:** Прежде чем добавлять сложные оптимизации, стоит сначала профилировать приложение, чтобы убедиться, что функция действительно является узким местом и её вычисление действительно дорогостоящее. Инструменты для профилирования помогут определить, где находятся реальные проблемы с производительностью.

Мемоизация функций, не относящихся к компонентам или хукам, требует дополнительной работы и не является частью стандартного поведения React.

## Уход от forwardRef

> [!Описание] > `ref` теперь будет передаваться как пропсы, а не с использованием `forwardRef()`крюк. Это упростит код. Поэтому после React19 вам не нужно будет использовать `forwardRef()`.

#### До:

Вот пример того, как вы могли бы использовать `forwardRef()` до React 19:

```javascript
import React, { forwardRef } from 'react'

const ExampleButton = forwardRef((props, ref) => (
  <button ref={ref}>{props.children}</button>
))
```

#### После:

`ref`можно передать как реквизит. Больше не требуется `forwardRef()`.

```javascript
import React from 'react'

const ExampleButton = ({ ref, children }) => (
  <button ref={ref}>{children}</button>
)
```



## Form Actions

Теперь action из form можно обрабатывать в react компоненте

#### Обработка синхронной формы

```jsx
'use client'
// Sync form action
const FromAction = () => {

	const submit = (formData) => {
		const name = formData.get('name')
		console.log('submit with name: ' + name)
	}
	
	return (
		<form className="border m-5 w-fit" action={submit}>
			<input placeholder="Имя" name="name" type="text" />
			<button type="submit">Подтвердить</button>
		</form>
	
	)

}
```


## useFormStatus

Новый хук

```js
const { pending, data, method, action } = useFormStatus();
```

Этот хук предоставляет информацию о статусе формы. `pending` состояние указывает, отправляется ли форма, и `data` это `FormData`объект, содержащий отправленные данные. Мы используем это состояние ожидания, чтобы показать загрузчик.


#### Обработка асинхронной формы

```jsx

// Async form action
const FromActionAsync = () => {
  const submit = async (formData) => {
    await sleep(2000)
    const name = formData.get('name')
    console.log('submit with name: ' + name)
    return null
  }

  return (
    <form className="border m-5 w-fit" action={submit}>
      <input placeholder="Имя" name="name" type="text" />
      <SubmitBtn />
    </form>
  )
}


const SubmitBtn = () => {
  // Хук обязательно должен вызываться внутри формы
  const { pending } = useFormStatus()
  
  return (
    <button
      className={pending ? 'bg-red-500' : 'bg-blue-500'}
      disabled={pending}
      type="submit"
    >
      Подтвердить
    </button>
  )
}

```




## useActionState

### Использование информации, возвращаемой действием формы

```jsx
const [state, formAction] = useActionState(fn, initialState, permalink?);
```

Вызов `useActionState` на верхнем уровне вашего компонента, чтобы получить доступ к возвращаемому значению действия с момента последней отправки формы.

```jsx
import { useActionState } from 'react';
import { action } from './actions.js';

function MyComponent() {
  const [state, formAction] = useActionState(action, null);
  // ...
  return (
    <form action={formAction}>
      {/* ... */}
      {state?.message}
    </form>
  );
}
```

`useActionState` возвращает массив ровно с двумя элементами:

1. Текущее состояние формы, которое изначально установлено в исходное состояние , которое вы указали, а после отправки формы устанавливается в возвращаемое значение действия . предоставленного вами
2. Новое действие которому вы переходите `<form>` как это `action` реквизит.

Когда форма будет отправлена, действия будет вызвана предоставленная вами функция . Его возвращаемое значение станет новым текущим состоянием формы.


```jsx
const [error, submitAction, isPending] = useActionState(
  async (previousState, newName) => {
    const error = await updateName(newName);
    if (error) {
      // You can return any result of the action.
      // Here, we return only the error.
      return error;
    }

    // handle success
    return null;
  },
  null,
);
```

`useActionState`принимает функцию («Действие») и возвращает завернутое действие для вызова. Это работает, потому что действия составляют. Когда вызывается обернутое действие, `useActionState` вернет последний результат действия как `data`и ожидающее состояние действия как `pending`.