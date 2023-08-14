import { useState } from "react";
import api from "./services/api";
import "./app.css";
import "./global.css";
import "./sidebar.css";
import "./main.css";
import { Notes } from "./Components/Notes";
import { useEffect } from "react";
import { RadioButton } from "./Components/RadioButton";

function App() {
  const [selectedValue, setSelectValue] = useState("all");
  const [title, setTitle] = useState("");
  const [notes, setNote] = useState("");
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAllNotes();
  }, []);

  async function getAllNotes() {
    try {
      setLoading(true);
      const response = await api.get("/anotacoes");
      setAllNotes(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadNotes(option) {
    const params = { priority: option };
    const response = await api.get("/priorities", { params });

    if (response) {
      setAllNotes(response.data);
    }
  }

  function handleChange(e) {
    setSelectValue(e.value);

    if (e.checked && e.value !== "all") {
      loadNotes(e.value);
    } else {
      getAllNotes();
    }
  }

  async function handleDelete(id) {
    const deletedNote = await api.delete(`/anotacoes/${id}`);

    if (deletedNote) {
      setAllNotes(allNotes.filter((note) => note._id !== id));
    }
  }

  async function handleChangePriority(id) {
    const note = await api.post(`/priorities/${id}`);

    if (note && selectedValue !== "all") {
      loadNotes(selectedValue);
    } else if (note) {
      getAllNotes();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (title.value !== "" && notes.value !== "") {
      try {
        setLoading(true);
        const response = await api.post("/anotacoes", {
          title,
          notes,
          priority: false,
        });
        setAllNotes([...allNotes, response.data]);
      } catch {
        alert("Não foi possível postar a anotação.");
      } finally {
        setLoading(false);
        setNote("");
        setTitle("");
        if (selectedValue !== "all") {
          getAllNotes();
        }
        setSelectValue("all");
      }
    }
  }

  return (
    <div id="app">
      <aside>
        <strong>Caderno de Notas</strong>
        <form onSubmit={handleSubmit}>
          <div className="input-block">
            <label htmlFor="title">Título da Anotação</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength="50"
            />
          </div>

          <div className="input-block">
            <label htmlFor="nota">Anotações</label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

          {title !== "" && notes !== "" ? (
            <button type="submit" className="buttonTrue">
              Salvar
            </button>
          ) : (
            <button className="buttonFalse" disabled>
              Salvar
            </button>
          )}
        </form>
        <RadioButton
          selectedValue={selectedValue}
          handleChange={handleChange}
        />
      </aside>
      <main>
        <ul>
          {error
            ? `Aconteceu um erro. Entre em contato com o administrador...`
            : ""}
          {loading ? <p>Carregando...</p> : ""}
          {allNotes.map((data) => (
            <Notes
              key={data._id}
              data={data}
              handleDelete={handleDelete}
              handleChangePriority={handleChangePriority}
            />
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
