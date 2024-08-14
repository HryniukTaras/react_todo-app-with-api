/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useState } from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/todo';
import { TodoDeleteButton } from '../TodoDeleteButton';

type Props = {
  todo: Todo;
  onDelete: (id: number) => void;
  isCompletedDeleting: boolean;
  isUpdatingTodos: boolean;
  changeTodo: (todo: Todo) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  onDelete,
  isCompletedDeleting,
  changeTodo,
  isUpdatingTodos,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputIsEditing, setInputIsEditing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await changeTodo({ ...todo, completed: !todo.completed });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setInputText('');
      setInputIsEditing(false);
    }
  };

  const handleSubmit = async () => {
    if (inputText.trim() && inputText.trim() !== todo.title) {
      setIsUpdating(true);
      try {
        await changeTodo({ ...todo, title: inputText.trim() });
      } finally {
        setIsUpdating(false);
        setInputIsEditing(false);
      }
    }

    if (!inputText.trim()) {
      handleDelete();
    }

    setInputIsEditing(false);
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleUpdate}
          disabled={isUpdating || isCompletedDeleting}
        />
      </label>

      {inputIsEditing ? (
        <form
          onSubmit={event => {
            event.preventDefault();

            handleSubmit();
          }}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={inputText}
            autoFocus
            onBlur={handleSubmit}
            onKeyUp={handleKeyUp}
            onChange={event => setInputText(event.target.value)}
          />
        </form>
      ) : (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => {
            setInputIsEditing(true);
            setInputText(todo.title);
          }}
        >
          {todo.title}
        </span>
      )}

      {!inputIsEditing && (
        <TodoDeleteButton onDelete={handleDelete} todoId={todo.id} />
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active':
            isCompletedDeleting || isDeleting || isUpdating || isUpdatingTodos,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
