import React, { useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID, changeTodo, deleteTodo, getTodos } from './api/todos';
import { Todo } from './types/todo';
import classNames from 'classnames';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [completedDeletingIds, setCompletedDeletingIds] = useState<Set<number>>(
    new Set(),
  );
  const [updatingTodosIds, setUpdatingTodosIds] = useState<Set<number>>(
    new Set(),
  );

  // fetch todos from the server on component mount
  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      });
  }, []);

  // filter todos based on the current status (all, active, completed)
  const filteredTodos = useMemo(() => {
    switch (status) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [status, todos]);

  // deletes a todo by id and updates the state
  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      // throws error to be caught in another component (TodoItem.tsx)
      throw error;
    }
  };

  // deletes all completed todos and updates the state
  const handleDeleteCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    //sets todos ids which being deleted (this enables the loader to be turned on in TodoItem.tsx)
    setCompletedDeletingIds(new Set(completedTodos.map(todo => todo.id)));

    const deletionPromises = completedTodos.map(todo =>
      handleDeleteTodo(todo.id),
    );

    await Promise.all(deletionPromises);

    setCompletedDeletingIds(new Set());

    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  // updates a todo and updates the state with the new todo
  const handleChangeTodo = async (updatedTodo: Todo) => {
    try {
      const changedTodo = await changeTodo(updatedTodo);

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === updatedTodo.id ? changedTodo : todo,
        ),
      );
    } catch (error) {
      setErrorMessage('Unable to update a todo');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      // throws error to be caught in another component (TodoItem.tsx)
      throw error;
    }
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          setTodos={setTodos}
          setUpdatingTodosIds={setUpdatingTodosIds}
          setErrorMessage={setErrorMessage}
          setTempTodo={setTempTodo}
          changeTodoStatus={handleChangeTodo}
        />

        <TodoList
          todos={filteredTodos}
          tempTodo={tempTodo}
          onDelete={handleDeleteTodo}
          completedDeletingIds={completedDeletingIds}
          updatingTodosIds={updatingTodosIds}
          changeTodo={handleChangeTodo}
        />

        {!!todos.length && (
          <Footer
            todos={todos}
            handleDeleteCompleted={handleDeleteCompleted}
            status={status}
            setStatus={setStatus}
          />
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
