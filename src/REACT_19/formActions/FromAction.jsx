'use clinet'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sleep } from '../../uitls/sleep'

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

// Async form action
const FromActionAsync = () => {
  const [state, submit, isPending] = useActionState(
    async (prevState, newState) => {
      await sleep(2000)
      return 'Успешно!'
    }
  )

  const isAvalibleNewState = !isPending && state

  return (
    <form className="border m-5 w-fit" action={submit}>
      <div className="text-center font-bold text-2xl">
        <p className="text-green-400">{isAvalibleNewState && state}</p>
        <p className="text-blue-400">{isPending && 'Загрузка...'}</p>
      </div>
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

export { FromAction, FromActionAsync }
