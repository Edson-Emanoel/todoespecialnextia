"use client";

import "./globals.css";
import Image from "next/image";
import { useState, useEffect } from "react";

import { Toaster, toast } from "sonner";

import taskIcon from "@/public/icons/taskIc.png";
import plusIcon from "@/public/icons/plusIc.png";
import editIcon from "@/public/icons/editIc.svg";
import trashIcon from "@/public/icons/trashIc.svg";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("http://localhost:3001/todos");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast.error("Erro ao carregar tarefas.");
    }
  };

  const handleAddTask = async () => {
    if (!inputValue.trim()) {
      toast.warning("Digite uma tarefa!");
      return;
    }

    const newTodo = {
      text: inputValue,
      completed: false,
    };

    try {
      const response = await fetch("http://localhost:3001/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      if (response.ok) {
        const savedTodo = await response.json();
        setTodos([...todos, savedTodo]);
        setInputValue("");
        toast.success("Tarefa criada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Erro ao criar tarefa.");
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic update
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: newStatus } : todo
      )
    );

    try {
      const response = await fetch(`http://localhost:3001/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: newStatus }),
      });

      if (!response.ok) {
        // Revert if failed
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: currentStatus } : todo
          )
        );
        console.error("Erro ao atualizar status da tarefa");
        toast.error("Erro ao atualizar status.");
      } else {
        toast.success(
          newStatus ? "Tarefa concluída!" : "Tarefa marcada como pendente!"
        );
      }
    } catch (error) {
      // Revert if error
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: currentStatus } : todo
        )
      );
      console.error("Erro ao atualizar status da tarefa:", error);
      toast.error("Erro ao atualizar status.");
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic update
    const previousTodos = todos;
    setTodos(todos.filter((todo) => todo.id !== id));

    try {
      const response = await fetch(`http://localhost:3001/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Revert if failed
        setTodos(previousTodos);
        console.error("Erro ao excluir tarefa");
        toast.error("Erro ao excluir tarefa.");
      } else {
        toast.success("Tarefa excluída com sucesso!");
      }
    } catch (error) {
      // Revert if error
      setTodos(previousTodos);
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa.");
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editText.trim()) {
      toast.warning("A tarefa não pode estar vazia!");
      return;
    }

    const currentId = editingId;
    const currentText = editText;
    const previousTodos = todos;

    // Optimistic update
    setTodos(
      todos.map((todo) =>
        todo.id === currentId ? { ...todo, text: currentText } : todo
      )
    );
    setEditingId(null);
    setEditText("");

    try {
      const response = await fetch(`http://localhost:3001/todos/${currentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentText }),
      });

      if (!response.ok) {
        // Revert if failed
        setTodos(previousTodos);
        console.error("Erro ao editar tarefa");
        toast.error("Erro ao editar tarefa.");
      } else {
        toast.success("Tarefa atualizada com sucesso!");
      }
    } catch (error) {
      // Revert if error
      setTodos(previousTodos);
      console.error("Erro ao editar tarefa:", error);
      toast.error("Erro ao editar tarefa.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="w-screen h-screen flex lg:items-center justify-center bg-[#0f1116] text-white">
      <Toaster position="bottom-right" richColors />
      <div className="w-screen gap-8 px-5 p-5 flex flex-col justify-center rounded-md lg:w-[75%] lg:py-5 lg:px-28 lg:h-3/4 lg:gap-7">
        {/* Header */}
        <div className="text-center flex items-center justify-center mb-12 gap-2">
          <Image src={taskIcon} alt="task-ic" width={22} height={19} />
          <h3 className="text-3xl font-semibold">App Tarefa</h3>
        </div>

        {/* Form */}
        <div className="w-full flex items-center justify-center gap-1 lg:m-0 lg:mb-6 sm:max-w-[815px] lg:max-w-full lg:pr-2.5">
          <input
            type="text"
            className="w-full text-lg lg:text-base px-2 h-12 rounded-md outline-none bg-[#1D232F] placeholder-gray-500 focus:ring-2 focus:ring-[#56CA81] transition-all"
            placeholder="Digite uma nova Tarefa"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleAddTask}
            className="px-2 w-[12%] lg:w-24 h-12 lg:text-sm lg:font-semibold rounded-md bg-[#56CA81] hover:bg-[#4ab573] hover:cursor-pointer transition-colors flex items-center justify-center"
          >
            <span className="hidden lg:block">Adicionar</span>

            <span className="flex lg:hidden justify-center">
              <Image src={plusIcon} alt="task-ic" width={22} height={19} />
            </span>
          </button>
        </div>

        {/* TasksList */}
        <div className="p-0 max-h-96 w-full flex flex-col items-center gap-[19px] lg:overflow-y-auto custom-scroll pr-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="w-full px-3 py-3 lg:py-5 flex items-center justify-between gap-5 rounded-md bg-[#1D232F] hover:bg-[#252c3a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="w-5 h-5 border-2 border-[#7B94C5] rounded-md accent-[#56CA81] cursor-pointer"
                />
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditText("");
                      }
                    }}
                    autoFocus
                    className="text-lg bg-transparent outline-none text-white w-full border-b border-[#56CA81]"
                  />
                ) : (
                  <p
                    className={`text-lg ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.text}
                  </p>
                )}
              </div>

              {/* Btns */}
              <div className="flex gap-1 lg:gap-1">
                <button
                  onClick={() =>
                    editingId === todo.id
                      ? saveEdit()
                      : startEditing(todo.id, todo.text)
                  }
                  className="p-1 hover:bg-[#2f3545] rounded-md transition-colors cursor-pointer"
                >
                  <Image
                    src={editIcon}
                    alt="Editar Tarefa"
                    width={19}
                    height={19}
                    className={editingId === todo.id ? "opacity-50" : ""}
                  />
                </button>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 hover:bg-[#2f3545] rounded-md transition-colors cursor-pointer"
                >
                  <Image
                    src={trashIcon}
                    alt="Excluir Tarefa"
                    width={22}
                    height={22}
                  />
                </button>
              </div>
            </div>
          ))}
          {todos.length === 0 && (
            <p className="text-gray-500 mt-4">Nenhuma tarefa encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
