// src/pages/UserEdit.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./styles/UserEdit.css";

import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import useAuth from "../hooks/useAuth";

import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";

const PATH_USERS = "/users";
const PATH_SENPLADES = "/senplades";
const PATH_VARIABLES = "/variables";
const PATH_EMPRESAS = "/empresas";
const PATH_SECTOR = "/sector";
const PATH_EMPRESA_SECCIONES = "/empresa-secciones";


const initialEmpresaForm = {
  razonSocial: "",
  nombreComercial: "",
  ruc: "",
  direccion: "",
  ciudad: "",
  provincia: "",
  correo: "",
  telefono: "",
  gerente: "",
  contactoGerente: "",
  correoGerente: "",
  sector: "",
  subSector: "",
  especialidad: "",
  numeroEmpleados: "",
  sitioWeb: "",
  logoUrl: "",
  activo: true,
};

const UserEdit = () => {
  const dispatch = useDispatch();

  const debounceRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  /* ========================================
     NAVEGACIÓN
  ======================================== */

  const [activeSection, setActiveSection] = useState("usuarios");
  const [menuOpen, setMenuOpen] = useState(false);

  /* ========================================
     USUARIOS
  ======================================== */

  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userEdit, setUserEdit] = useState(false);

  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [userIdDelete, setUserIdDelete] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cI, setCI] = useState("");
  const [cellular, setCellular] = useState("");
  const [dateBirth, setDateBirth] = useState("");

  const [cantonesOption, setCantonesOption] = useState([]);
  const [subsectorOption, setSubsectorOption] = useState([]);

  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedGenero, setSelectedGenero] = useState("");
  const [selectedGrado, setSelectedGrado] = useState("");
  const [selectedSubsistema, setSelectedSubsistema] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [selectedEmpresaId, setSelectedEmpresaId] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedSubsector, setSelectedSubsector] = useState("");

  /* ========================================
     EMPRESAS
  ======================================== */

  const [empresaForm, setEmpresaForm] = useState(initialEmpresaForm);
  const [empresaEditingId, setEmpresaEditingId] = useState(null);
  const [showEmpresaForm, setShowEmpresaForm] = useState(false);

  const [empresaCantones, setEmpresaCantones] = useState([]);
  const [empresaSubsector, setEmpresaSubsector] = useState([]);

  const [empresaSearch, setEmpresaSearch] = useState("");

  const [showDeleteEmpresa, setShowDeleteEmpresa] = useState(false);
  const [empresaDelete, setEmpresaDelete] = useState(null);





  const [empresaSeccionNombre, setEmpresaSeccionNombre] =
    useState("");

  const [
    empresaSeccionesApi,
    getEmpresaSecciones,
    createEmpresaSeccionApi,
    deleteEmpresaSeccionApi,
    updateEmpresaSeccionApi,
    empresaSeccionError,
    isLoadingEmpresaSecciones,
    empresaSeccionCreada,
    empresaSeccionEliminada,
    empresaSeccionActualizada,
  ] = useCrud();

  const [empresaSeccionEditingId, setEmpresaSeccionEditingId] =
    useState(null);

  const [empresaSeccionDelete, setEmpresaSeccionDelete] =
    useState(null);

  /* ========================================
     API
  ======================================== */

  const [senplades, getSenplades] = useCrud();
  const [variables, getVariables] = useCrud();
  const [sector, getSector] = useCrud();


  const [
    usersAll,
    getUsers,
    ,
    ,
    ,
    ,
    isLoadingUsers,
  ] = useCrud();

  const [
    empresasApi,
    getEmpresas,
    createEmpresaApi,
    deleteEmpresaApi,
    updateEmpresaApi,
    empresaError,
    isLoadingEmpresas,
    empresaCreada,
    empresaEliminada,
    empresaActualizada,
  ] = useCrud();

  const [
    ,
    updateUser,
    ,
    loggedUser,
    ,
    ,
    isLoadingAuth,
    error,
    ,
    ,
    ,
    ,
    userUpdate,
    ,
    ,
    deleteUserApi,
    deleteReg,
  ] = useAuth();

  /* ========================================
     CARGA INICIAL
  ======================================== */

  useEffect(() => {
    getSenplades(PATH_SENPLADES);
    getVariables(PATH_VARIABLES);
    getEmpresas(PATH_EMPRESAS);
    getSector(PATH_SECTOR);
  }, []);


  useEffect(() => {
    getUsers(`${PATH_USERS}?page=1&limit=50000`);
  }, [userUpdate]);

  useEffect(() => {
    if (userUpdate) {
      loggedUser();
    }
  }, [userUpdate]);

  useEffect(() => {
    if (!empresaCreada) return;

    const nuevaEmpresa =
      empresaCreada?.empresa ||
      empresaCreada?.data?.empresa ||
      empresaCreada?.data ||
      empresaCreada;

    const nuevaEmpresaId = nuevaEmpresa?.id;

    showSuccess("Empresa creada correctamente.");

    getEmpresas(PATH_EMPRESAS);

    if (nuevaEmpresaId) {
      setEmpresaEditingId(nuevaEmpresaId);
      setShowEmpresaForm(true);

      cargarSeccionesEmpresa(nuevaEmpresaId);

      showSuccess(
        "Empresa creada. Ahora puede registrar sus secciones."
      );
    } else {
      limpiarEmpresaForm();
      setShowEmpresaForm(false);
    }
  }, [empresaCreada]);



  useEffect(() => {
    if (!empresaActualizada) return;

    showSuccess("Empresa actualizada correctamente.");

    limpiarEmpresaForm();
    setShowEmpresaForm(false);
    getEmpresas(PATH_EMPRESAS);
  }, [empresaActualizada]);


  useEffect(() => {
    if (!empresaEliminada) return;

    showSuccess(
      empresaEliminada?.message ||
      "Empresa eliminada correctamente."
    );

    setShowDeleteEmpresa(false);
    setEmpresaDelete(null);

    limpiarEmpresaForm();
    getEmpresas(PATH_EMPRESAS);
  }, [empresaEliminada]);


  useEffect(() => {
    if (!empresaError) return;

    const message =
      empresaError?.response?.data?.message ||
      empresaError?.response?.data?.error ||
      empresaError?.response?.data?.errors?.[0]?.message ||
      "No se pudo completar la operación con la empresa.";

    showError(message);
  }, [empresaError]);




  /* ========================================
     ALERTAS
  ======================================== */

  useEffect(() => {
    if (!error) return;

    const message =
      error?.response?.data?.message ||
      "Ocurrió un error al actualizar el usuario.";

    dispatch(
      showAlert({
        message: `⚠️ ${message}`,
        alertType: 1,
      })
    );
  }, [error, dispatch]);

  useEffect(() => {
    if (!deleteReg) return;

    dispatch(
      showAlert({
        message: deleteReg?.message || "Usuario eliminado.",
        alertType: 2,
      })
    );
  }, [deleteReg, dispatch]);

  /* ========================================
     MENÚ RESPONSIVE
  ======================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSelectSection = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  /* ========================================
     DATOS NORMALIZADOS
  ======================================== */

  const usersList = useMemo(() => {
    if (Array.isArray(usersAll)) return usersAll;
    return usersAll?.data || [];
  }, [usersAll]);

  const empresasList = useMemo(() => {
    if (Array.isArray(empresasApi)) return empresasApi;
    return empresasApi?.data || [];
  }, [empresasApi]);

  const senpladesVal = Array.isArray(senplades) ? senplades : [];
  const variablesVal = Array.isArray(variables) ? variables : [];
  const sectorVal = Array.isArray(sector) ? sector : [];


  const empresasFiltradas = useMemo(() => {
    const search = empresaSearch.trim().toLowerCase();

    if (!search) return empresasList;

    return empresasList.filter((empresa) => {
      const contenido = [
        empresa.razonSocial,
        empresa.nombreComercial,
        empresa.ruc,
        empresa.correo,
        empresa.telefono,
        empresa.ciudad,
        empresa.provincia,
        empresa.sector,
        empresa.subSector,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenido.includes(search);
    });
  }, [empresasList, empresaSearch]);



  const empresaSeccionesList = useMemo(() => {
    if (Array.isArray(empresaSeccionesApi)) {
      return empresaSeccionesApi;
    }

    return empresaSeccionesApi?.data || [];
  }, [empresaSeccionesApi]);



  const cargarSeccionesEmpresa = async (empresaId) => {
    if (!empresaId) return;

    await getEmpresaSecciones(
      `${PATH_EMPRESA_SECCIONES}?empresaId=${empresaId}`
    );
  };



  const guardarEmpresaSeccion = async () => {
    if (!empresaEditingId) {
      showError(
        "Primero debe guardar la empresa para registrar secciones."
      );
      return;
    }

    const nombre = empresaSeccionNombre.trim();

    if (!nombre) {
      showError("Ingrese el nombre de la sección.");
      return;
    }

    const nombreDuplicado = empresaSeccionesList.some(
      (seccion) =>
        seccion.id !== empresaSeccionEditingId &&
        String(seccion.nombre || "")
          .trim()
          .toLowerCase() === nombre.toLowerCase()
    );

    if (nombreDuplicado) {
      showError(
        "Esta empresa ya tiene una sección con ese nombre."
      );
      return;
    }

    const data = {
      empresaId: empresaEditingId,
      nombre: capitalizeWords(nombre),
    };

    if (empresaSeccionEditingId) {
      await updateEmpresaSeccionApi(
        PATH_EMPRESA_SECCIONES,
        empresaSeccionEditingId,
        data
      );
    } else {
      await createEmpresaSeccionApi(
        PATH_EMPRESA_SECCIONES,
        data
      );
    }
  };




  const editarEmpresaSeccion = (seccion) => {
    setEmpresaSeccionEditingId(seccion.id);
    setEmpresaSeccionNombre(seccion.nombre || "");
  };

  const cancelarEdicionEmpresaSeccion = () => {
    setEmpresaSeccionEditingId(null);
    setEmpresaSeccionNombre("");
  };






  const eliminarEmpresaSeccion = async (seccion) => {
    if (!seccion?.id) return;

    await deleteEmpresaSeccionApi(
      PATH_EMPRESA_SECCIONES,
      seccion.id
    );
  };  /* ========================================
     FUNCIONES GENERALES
  ======================================== */

  const capitalizeWords = (value = "") =>
    value
      .trim()
      .split(/\s+/)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");

  const validarCedula = (cedula) => {
    const cedulaLimpia = String(cedula || "").replace(/\D/g, "");

    if (!/^\d{10}$/.test(cedulaLimpia)) {
      return false;
    }

    const digitos = cedulaLimpia.split("").map(Number);
    const digitoVerificador = digitos.pop();

    let suma = 0;

    for (let index = 0; index < digitos.length; index += 1) {
      let valor = digitos[index];

      if (index % 2 === 0) {
        valor *= 2;

        if (valor > 9) {
          valor -= 9;
        }
      }

      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;

    return decenaSuperior - suma === digitoVerificador;
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(value || "").trim().toLowerCase()
    );

  const showSuccess = (message) => {
    dispatch(
      showAlert({
        message: `✅ ${message}`,
        alertType: 2,
      })
    );
  };

  const showError = (message) => {
    dispatch(
      showAlert({
        message: `⚠️ ${message}`,
        alertType: 1,
      })
    );
  };

  /* ========================================
     PROVINCIAS Y CANTONES
  ======================================== */

  const obtenerCantonesPorProvincia = (provincia) =>
    senpladesVal.filter(
      (item) => item.provincia === provincia
    );

  const handleProvinciaChange = (provincia) => {
    setSelectedProvincia(provincia);

    const cantones = obtenerCantonesPorProvincia(provincia);

    setCantonesOption(cantones);
    setSelectedCanton("");
  };





  /* ========================================
     PROVINCIAS Y CANTONES
  ======================================== */

  const obtenerSubsectorPorSector = (sectorSeleccionado) =>
    sectorVal.filter(
      (item) =>
        String(item.sector || "")
          .trim()
          .toLowerCase() ===
        String(sectorSeleccionado || "")
          .trim()
          .toLowerCase()
    );


  /* ========================================
     BUSCADOR DE USUARIOS
  ======================================== */



  useEffect(() => {
    if (!empresaSeccionCreada || !empresaEditingId) return;

    showSuccess("Sección registrada correctamente.");

    cancelarEdicionEmpresaSeccion();
    cargarSeccionesEmpresa(empresaEditingId);
  }, [empresaSeccionCreada]);


  useEffect(() => {
    if (!empresaSeccionActualizada || !empresaEditingId) return;

    showSuccess("Sección actualizada correctamente.");

    cancelarEdicionEmpresaSeccion();
    cargarSeccionesEmpresa(empresaEditingId);
  }, [empresaSeccionActualizada]);

  useEffect(() => {
    if (!empresaSeccionEliminada || !empresaEditingId) return;

    showSuccess(
      empresaSeccionEliminada?.message ||
      "Sección eliminada correctamente."
    );

    cancelarEdicionEmpresaSeccion();
    cargarSeccionesEmpresa(empresaEditingId);
  }, [empresaSeccionEliminada]);




  useEffect(() => {
    if (!empresaSeccionError) return;

    const message =
      empresaSeccionError?.response?.data?.message ||
      empresaSeccionError?.response?.data?.error ||
      "No se pudo completar la operación con la sección.";

    showError(message);
  }, [empresaSeccionError]);




  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const text = query.trim().toLowerCase();

    if (text.length < 2) {
      setSugerencias([]);
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      const usersMap = new Map();

      usersList.forEach((user) => {
        if (!user) return;

        const identification = String(user.cI || "");

        const fullName = `${user.firstName || ""} ${user.lastName || ""
          }`
          .trim()
          .toLowerCase();

        const userEmail = String(user.email || "").toLowerCase();

        const coincide =
          identification.includes(text) ||
          fullName.includes(text) ||
          userEmail.includes(text);

        if (coincide && !usersMap.has(user.id)) {
          usersMap.set(user.id, user);
        }
      });

      setSugerencias(
        Array.from(usersMap.values()).slice(0, 10)
      );
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, usersList]);

  const seleccionarUser = (user) => {
    setSelectedUser(user);
    setUserEdit(false);
    setSugerencias([]);

    setQuery(
      `${user.firstName || ""} ${user.lastName || ""}`.trim()
    );

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setCI(user.cI || "");
    setCellular(user.cellular || "");
    setDateBirth(
      user.dateBirth
        ? String(user.dateBirth).substring(0, 10)
        : ""
    );

    setSelectedProvincia(user.province || "");

    setCantonesOption(
      obtenerCantonesPorProvincia(user.province || "")
    );


    setSelectedSector(user.sector || "");



    setSubsectorOption(
      obtenerSubsectorPorSector(user.sector || "")
    );

    setSelectedCanton(user.city || "");
    setSelectedGenero(user.genre || "");
    setSelectedGrado(user.grado || "");
    setSelectedSubsistema(user.subsistema || "");
    setSelectedRole(user.role || "student");
    setSelectedEmpresaId(user.empresaId || "");
  };

  const limpiarUsuario = () => {
    setQuery("");
    setSugerencias([]);
    setSelectedUser(null);
    setUserEdit(false);

    setFirstName("");
    setLastName("");
    setEmail("");
    setCI("");
    setCellular("");
    setDateBirth("");

    setSelectedProvincia("");
    setCantonesOption([]);
    setSubsectorOption([]);

    setSelectedCanton("");
    setSelectedGenero("");
    setSelectedGrado("");
    setSelectedSubsistema("");
    setSelectedRole("student");
    setSelectedEmpresaId("");
  };

  /* ========================================
     ACTUALIZAR USUARIO
  ======================================== */

  const submitUpdate = async (event) => {
    event.preventDefault();

    if (!selectedUser?.id) {
      showError("Seleccione un usuario.");
      return;
    }

    const cedulaLimpia = String(cI || "")
      .trim()
      .replace(/\D/g, "");

    const celularLimpio = String(cellular || "")
      .trim()
      .replace(/\D/g, "");

    const emailFormateado = String(email || "")
      .trim()
      .toLowerCase();

    if (cedulaLimpia && !validarCedula(cedulaLimpia)) {
      showError("La cédula ingresada es incorrecta.");
      return;
    }

    if (!isValidEmail(emailFormateado)) {
      showError("El correo electrónico es incorrecto.");
      return;
    }

    if (
      celularLimpio &&
      !/^09\d{8}$/.test(celularLimpio)
    ) {
      showError(
        "El celular debe iniciar con 09 y tener 10 dígitos."
      );
      return;
    }

    const formattedData = {
      firstName: capitalizeWords(firstName),
      lastName: capitalizeWords(lastName),
      email: emailFormateado,

      cI: cedulaLimpia || null,
      cellular: celularLimpio || null,
      dateBirth: dateBirth || null,

      province: selectedProvincia || null,
      city: selectedCanton || null,
      genre: selectedGenero || null,
      grado: selectedGrado || null,
      subsistema: selectedSubsistema || null,

      role: selectedRole || "student",

      // Empresa opcional
      empresaId: selectedEmpresaId || null,
    };

    try {
      await updateUser(formattedData, selectedUser.id);

      showSuccess("Usuario actualizado correctamente.");

      setUserEdit(false);

      await getUsers(
        `${PATH_USERS}?page=1&limit=50000`
      );

      setSelectedUser((previous) =>
        previous
          ? {
            ...previous,
            ...formattedData,
          }
          : previous
      );
    } catch (updateError) {
      const message =
        updateError?.response?.data?.message ||
        "No se pudo actualizar el usuario.";

      showError(message);
    }
  };




  const deleteUser = async () => {
    if (!userIdDelete) return;

    try {
      await deleteUserApi(userIdDelete);

      showSuccess("Usuario eliminado correctamente.");

      setShowDeleteUser(false);
      setUserIdDelete(null);

      limpiarUsuario();

      await getUsers(
        `${PATH_USERS}?page=1&limit=50000`
      );
    } catch (deleteError) {
      const message =
        deleteError?.response?.data?.message ||
        "No se pudo eliminar el usuario.";

      showError(message);
    }
  };

  /* ========================================
     EMPRESAS
  ======================================== */

  const handleEmpresaInput = (event) => {
    const { name, value, type, checked } = event.target;

    setEmpresaForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEmpresaProvinciaChange = (event) => {
    const provincia = event.target.value;

    const cantones = obtenerCantonesPorProvincia(provincia);

    setEmpresaCantones(cantones);

    setEmpresaForm((previous) => ({
      ...previous,
      provincia,
      ciudad: "",
    }));
  };


  const handleEmpresaSectorChange = (event) => {
    const sectorSeleccionado = event.target.value;

    const subsectores =
      obtenerSubsectorPorSector(sectorSeleccionado);

    setEmpresaSubsector(subsectores);

    setEmpresaForm((previous) => ({
      ...previous,
      sector: sectorSeleccionado,
      subSector: "",
    }));
  };


  const limpiarEmpresaForm = () => {
    setEmpresaForm(initialEmpresaForm);
    setEmpresaEditingId(null);
    setEmpresaCantones([]);
    setEmpresaSubsector([]);

    setEmpresaSeccionNombre("");
    setEmpresaSeccionEditingId(null);
  };

  const cerrarEmpresaForm = () => {
    limpiarEmpresaForm();
    setShowEmpresaForm(false);
  };

  const validarEmpresa = () => {
    if (!empresaForm.razonSocial.trim()) {
      showError("Ingrese la razón social.");
      return false;
    }

    if (!empresaForm.correo.trim()) {
      showError("Ingrese el correo de la empresa.");
      return false;
    }

    if (!isValidEmail(empresaForm.correo)) {
      showError("El correo de la empresa no es válido.");
      return false;
    }

    if (!empresaForm.telefono.trim()) {
      showError("Ingrese el teléfono de la empresa.");
      return false;
    }

    if (!empresaForm.sector.trim()) {
      showError("Ingrese el sector de la empresa.");
      return false;
    }

    if (!empresaForm.subSector.trim()) {
      showError("Ingrese el subsector de la empresa.");
      return false;
    }

    if (
      !empresaForm.numeroEmpleados ||
      Number(empresaForm.numeroEmpleados) < 1
    ) {
      showError(
        "El número de empleados debe ser mayor que cero."
      );
      return false;
    }

    const rucLimpio = empresaForm.ruc.replace(/\D/g, "");

    if (rucLimpio && rucLimpio.length !== 13) {
      showError("El RUC debe contener 13 dígitos.");
      return false;
    }

    if (
      empresaForm.correoGerente.trim() &&
      !isValidEmail(empresaForm.correoGerente)
    ) {
      showError("El correo del gerente no es válido.");
      return false;
    }

    return true;
  };

  const submitEmpresa = (event) => {
    event.preventDefault();

    if (!validarEmpresa()) return;

    const data = {
      razonSocial: capitalizeWords(empresaForm.razonSocial),

      nombreComercial:
        empresaForm.nombreComercial.trim() || null,

      ruc:
        empresaForm.ruc.replace(/\D/g, "") || null,

      direccion:
        empresaForm.direccion.trim() || null,

      ciudad:
        empresaForm.ciudad.trim() || null,

      provincia:
        empresaForm.provincia.trim() || null,

      correo:
        empresaForm.correo.trim().toLowerCase(),

      telefono:
        empresaForm.telefono
          .replace(/[^\d+]/g, "")
          .trim(),

      gerente:
        empresaForm.gerente.trim() || null,

      contactoGerente:
        empresaForm.contactoGerente
          .replace(/[^\d+]/g, "")
          .trim() || null,

      correoGerente:
        empresaForm.correoGerente
          .trim()
          .toLowerCase() || null,

      sector:
        empresaForm.sector.trim(),

      subSector:
        empresaForm.subSector.trim(),

      especialidad:
        empresaForm.especialidad.trim() || null,

      numeroEmpleados:
        Number(empresaForm.numeroEmpleados),

      sitioWeb:
        empresaForm.sitioWeb.trim() || null,

      logoUrl:
        empresaForm.logoUrl.trim() || null,

      activo:
        Boolean(empresaForm.activo),
    };

    if (empresaEditingId) {
      updateEmpresaApi(
        PATH_EMPRESAS,
        empresaEditingId,
        data
      );
    } else {
      createEmpresaApi(PATH_EMPRESAS, data);
    }
  };

  const editarEmpresa = (empresa) => {
    setEmpresaEditingId(empresa.id);
    setEmpresaSeccionNombre("");
    setEmpresaSeccionEditingId(null);

    cargarSeccionesEmpresa(empresa.id);

    const provinciaGuardada = String(
      empresa.provincia || ""
    ).trim();

    const sectorGuardado = String(
      empresa.sector || ""
    ).trim();

    // Acepta cualquiera de los dos nombres
    const subSectorGuardado = String(
      empresa.subSector ??
      empresa.subsector ??
      ""
    ).trim();

    const cantones =
      obtenerCantonesPorProvincia(provinciaGuardada);

    const subsectores =
      obtenerSubsectorPorSector(sectorGuardado);

    /*
     * Se busca el valor exactamente como aparece
     * dentro de las opciones del select.
     */
    const subSectorCoincidente = subsectores.find(
      (item) => {
        const valorSubsector = String(
          item.subsector ??
          item.subSector ??
          ""
        )
          .trim()
          .toLowerCase();

        return (
          valorSubsector ===
          subSectorGuardado.toLowerCase()
        );
      }
    );

    const subSectorFinal = subSectorCoincidente
      ? String(
        subSectorCoincidente.subsector ??
        subSectorCoincidente.subSector ??
        ""
      ).trim()
      : subSectorGuardado;

    setEmpresaCantones(cantones);
    setEmpresaSubsector(subsectores);

    setEmpresaForm({
      razonSocial: empresa.razonSocial || "",
      nombreComercial: empresa.nombreComercial || "",
      ruc: empresa.ruc || "",
      direccion: empresa.direccion || "",
      ciudad: empresa.ciudad || "",
      provincia: provinciaGuardada,
      correo: empresa.correo || "",
      telefono: empresa.telefono || "",
      gerente: empresa.gerente || "",
      contactoGerente: empresa.contactoGerente || "",
      correoGerente: empresa.correoGerente || "",
      sector: sectorGuardado,
      subSector: subSectorFinal,
      especialidad: empresa.especialidad || "",
      numeroEmpleados: empresa.numeroEmpleados || "",
      sitioWeb: empresa.sitioWeb || "",
      logoUrl: empresa.logoUrl || "",
      activo:
        empresa.activo === undefined
          ? true
          : Boolean(empresa.activo),
    });

    setShowEmpresaForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const confirmarEliminarEmpresa = (empresa) => {
    setEmpresaDelete(empresa);
    setShowDeleteEmpresa(true);
  };

  const eliminarEmpresa = () => {
    if (!empresaDelete?.id) return;

    deleteEmpresaApi(
      PATH_EMPRESAS,
      empresaDelete.id
    );

    setShowDeleteEmpresa(false);

  };

  /* ========================================
     RENDER USUARIOS
  ======================================== */

  const renderUsuarios = () => (
    <section className="ue_card">
      <div className="ue_header">
        <div>
          <span className="ue_headerBadge">
            Gestión administrativa
          </span>

          <h2 className="ue_title">
            👤 Administración de usuarios
          </h2>

          <p className="ue_subtitle">
            Busca por <strong>cédula</strong>,{" "}
            <strong>nombres</strong> o{" "}
            <strong>correo</strong>. Selecciona el usuario y
            modifica su información.
          </p>
        </div>
      </div>

      <div className="ue_search">
        <div className="ue_searchBox">
          <input
            className="ue_input ue_input_center"
            type="text"
            placeholder="🔍 Buscar por cédula, nombres o correo..."
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            autoComplete="off"
          />

          {sugerencias.length > 0 && (
            <ul className="ue_suggest" role="listbox">
              {sugerencias.map((user) => (
                <li
                  key={user.id}
                  className="ue_suggestItem"
                  role="option"
                  onClick={() => seleccionarUser(user)}
                >
                  <div className="ue_suggestAvatar">
                    {String(user.firstName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="ue_suggestInfo">
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>

                    <span>
                      {user.cI || "Sin cédula"} ·{" "}
                      {user.email}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className="ue_btnLight"
          type="button"
          onClick={limpiarUsuario}
        >
          ✖ Limpiar
        </button>
      </div>

      {!selectedUser ? (
        <div className="ue_empty">
          <span className="ue_emptyIcon">🔎</span>

          <h3>Busca un usuario</h3>

          <p>
            Escribe al menos dos caracteres para ver las
            sugerencias.
          </p>
        </div>
      ) : (
        <section className="ue_profile">
          <div className="ue_profileTop">
            <div className="ue_profileIdentity">
              <div className="ue_profileAvatar">
                {String(selectedUser.firstName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3 className="ue_profileName">
                  {selectedUser.firstName}{" "}
                  {selectedUser.lastName}
                </h3>

                <p className="ue_profileMeta">
                  <strong>Email:</strong>{" "}
                  {selectedUser.email}
                </p>

                <p className="ue_profileMeta">
                  <strong>ID:</strong> {selectedUser.id}
                </p>
              </div>
            </div>

            <div className="ue_actions">
              <button
                type="button"
                className={
                  userEdit
                    ? "ue_btnSecondary"
                    : "ue_btnPrimary"
                }
                onClick={() =>
                  setUserEdit((previous) => !previous)
                }
              >
                {userEdit ? "Cancelar edición" : "Editar usuario"}

                <span className="ue_btnArrow">
                  {userEdit ? "✖" : "✎"}
                </span>
              </button>

              <button
                type="button"
                className="ue_btnDanger"
                onClick={() => {
                  setUserIdDelete(selectedUser.id);
                  setShowDeleteUser(true);
                }}
              >
                🗑 Eliminar
              </button>
            </div>
          </div>

          <form
            className="ue_form"
            onSubmit={submitUpdate}
          >
            <article className="ue_col">
              <h4 className="ue_colTitle">
                Información personal
              </h4>

              <label className="ue_label">
                <span className="ue_span">Nombres</span>

                <input
                  className="ue_input"
                  readOnly={!userEdit}
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  type="text"
                />
              </label>

              <label className="ue_label">
                <span className="ue_span">Apellidos</span>

                <input
                  className="ue_input"
                  readOnly={!userEdit}
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  type="text"
                />
              </label>

              <label className="ue_label">
                <span className="ue_span">
                  Correo electrónico
                </span>

                <input
                  className="ue_input"
                  readOnly={!userEdit}
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  type="email"
                />
              </label>

              <label className="ue_label">
                <span className="ue_span">Cédula</span>

                <input
                  className="ue_input"
                  readOnly={!userEdit}
                  value={cI}
                  onChange={(event) =>
                    setCI(event.target.value)
                  }
                  type="text"
                  maxLength={10}
                />
              </label>
            </article>

            <article className="ue_col">
              <h4 className="ue_colTitle">
                Contacto y acceso
              </h4>

              <label className="ue_label">
                <span className="ue_span">Celular</span>

                <input
                  className="ue_input"
                  readOnly={!userEdit}
                  value={cellular}
                  onChange={(event) =>
                    setCellular(event.target.value)
                  }
                  type="text"
                  maxLength={10}
                />
              </label>

              <label className="ue_label">
                <span className="ue_span">
                  Fecha de nacimiento
                </span>

                <input
                  className="ue_input"
                  readOnly={!userEdit}
                  value={dateBirth || ""}
                  onChange={(event) =>
                    setDateBirth(event.target.value)
                  }
                  type="date"
                />
              </label>

              <label className="ue_label">
                <span className="ue_span">Rol</span>

                <select
                  className="ue_input"
                  disabled={!userEdit}
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                >
                  <option value="student">student</option>

                  <option value="Administrador">
                    Administrador
                  </option>

                  <option value="SubAdministrador">
                    SubAdministrador
                  </option>

                  <option value="Validador">
                    Validador
                  </option>

                  <option value="Secretaria">
                    Secretaria
                  </option>

                  <option value="instituto_ciccenic">
                    instituto_ciccenic
                  </option>
                </select>
              </label>

              <label className="ue_label">
                <span className="ue_span">
                  Empresa
                </span>

                <select
                  className="ue_input"
                  disabled={!userEdit}
                  value={selectedEmpresaId}
                  onChange={(event) =>
                    setSelectedEmpresaId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    No pertenece a una empresa
                  </option>

                  {empresasList
                    .filter((empresa) => empresa.activo)
                    .map((empresa) => (
                      <option
                        key={empresa.id}
                        value={empresa.id}
                      >
                        {empresa.nombreComercial ||
                          empresa.razonSocial}
                      </option>
                    ))}
                </select>
              </label>
            </article>

            <article className="ue_col">
              <h4 className="ue_colTitle">
                Ubicación y perfil
              </h4>

              <label className="ue_label">
                <span className="ue_span">Provincia</span>

                <select
                  className="ue_input"
                  disabled={!userEdit}
                  value={selectedProvincia}
                  onChange={(event) =>
                    handleProvinciaChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">Seleccione</option>

                  {[
                    ...new Set(
                      senpladesVal.map(
                        (item) => item.provincia
                      )
                    ),
                  ].map((provincia) => (
                    <option
                      key={provincia}
                      value={provincia}
                    >
                      {provincia}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ue_label">
                <span className="ue_span">Ciudad</span>

                <select
                  className="ue_input"
                  disabled={!userEdit}
                  value={selectedCanton}
                  onChange={(event) =>
                    setSelectedCanton(
                      event.target.value
                    )
                  }
                >
                  <option value="">Seleccione</option>

                  {[
                    ...new Set(
                      cantonesOption.map(
                        (item) => item.canton
                      )
                    ),
                  ].map((canton) => (
                    <option
                      key={canton}
                      value={canton}
                    >
                      {canton}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ue_label">
                <span className="ue_span">Género</span>

                <select
                  className="ue_input"
                  disabled={!userEdit}
                  value={selectedGenero}
                  onChange={(event) =>
                    setSelectedGenero(
                      event.target.value
                    )
                  }
                >
                  <option value="">Seleccione</option>

                  {variablesVal
                    .filter((variable) => variable.genero)
                    .map((item) => (
                      <option
                        key={item.id}
                        value={item.genero}
                      >
                        {item.genero}
                      </option>
                    ))}
                </select>
              </label>


            </article>

            <div className="ue_footer">
              <button
                className="ue_btnPrimaryFull"
                type="submit"
                disabled={!userEdit}
              >
                Guardar cambios
                <span className="ue_btnArrow">➜</span>
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  );

  /* ========================================
     RENDER EMPRESAS
  ======================================== */

  const renderEmpresas = () => (
    <section className="ue_card">
      <div className="ue_header ue_headerCompany">
        <div>
          <span className="ue_headerBadge">
            Gestión empresarial
          </span>

          <h2 className="ue_title">
            🏢 Administración de empresas
          </h2>

          <p className="ue_subtitle">
            Registra empresas, modifica su información y
            administra las organizaciones disponibles para
            asociar a los usuarios.
          </p>
        </div>

        <div className="ue_companyCounter">
          <strong>{empresasList.length}</strong>

          <span>
            {empresasList.length === 1
              ? "empresa registrada"
              : "empresas registradas"}
          </span>
        </div>
      </div>

      {/* BARRA SUPERIOR */}

      <div className="ue_companyToolbar">
        <div className="ue_companyToolbarInfo">
          <h3>Empresas registradas</h3>

          <p>
            Consulta, edita o elimina las empresas disponibles.
          </p>
        </div>

        <div className="ue_companyToolbarActions">
          <input
            className="ue_input ue_companySearch"
            type="text"
            placeholder="🔍 Buscar empresa..."
            value={empresaSearch}
            onChange={(event) =>
              setEmpresaSearch(event.target.value)
            }
          />

          <button
            type="button"
            className="ue_btnPrimary ue_btnNewCompany"
            onClick={() => {
              limpiarEmpresaForm();
              setShowEmpresaForm(true);

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <span className="ue_addIcon">＋</span>
            Nueva empresa
          </button>
        </div>
      </div>

      {/* FORMULARIO OCULTO */}

      {showEmpresaForm && (
        <form
          className="ue_companyForm ue_companyFormExpanded"
          onSubmit={submitEmpresa}
        >
          <div className="ue_companyFormHeader">
            <div>
              <span className="ue_companyFormIcon">
                {empresaEditingId ? "✏️" : "➕"}
              </span>

              <div>
                <h3>
                  {empresaEditingId
                    ? "Editar empresa"
                    : "Registrar empresa"}
                </h3>

                <p>
                  Los campos marcados con * son obligatorios.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="ue_btnLight ue_btnSmall"
              onClick={cerrarEmpresaForm}
            >
              ✖ Cerrar
            </button>
          </div>

          <div className="ue_companyGrid">
            <label className="ue_label">
              <span className="ue_span">
                Razón social *
              </span>

              <input
                className="ue_input"
                type="text"
                name="razonSocial"
                value={empresaForm.razonSocial}
                onChange={handleEmpresaInput}
                placeholder="Nombre legal de la empresa"
                required
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Nombre comercial
              </span>

              <input
                className="ue_input"
                type="text"
                name="nombreComercial"
                value={empresaForm.nombreComercial}
                onChange={handleEmpresaInput}
                placeholder="Nombre conocido públicamente"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">RUC</span>

              <input
                className="ue_input"
                type="text"
                name="ruc"
                value={empresaForm.ruc}
                onChange={handleEmpresaInput}
                placeholder="13 dígitos"
                maxLength={13}
                inputMode="numeric"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Correo empresarial *
              </span>

              <input
                className="ue_input"
                type="email"
                name="correo"
                value={empresaForm.correo}
                onChange={handleEmpresaInput}
                placeholder="empresa@correo.com"
                required
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Teléfono *
              </span>

              <input
                className="ue_input"
                type="text"
                name="telefono"
                value={empresaForm.telefono}
                onChange={handleEmpresaInput}
                placeholder="022345678 o 0999999999"
                required
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Número de empleados *
              </span>

              <input
                className="ue_input"
                type="number"
                name="numeroEmpleados"
                value={empresaForm.numeroEmpleados}
                onChange={handleEmpresaInput}
                min="1"
                placeholder="Ej. 25"
                required
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">Sector *</span>

              <select
                className="ue_input"
                name="sector"
                value={empresaForm.sector}
                onChange={handleEmpresaSectorChange}
                required
              >
                <option value="">Seleccione un sector</option>

                {[
                  ...new Set(
                    sectorVal
                      .map((item) => item.sector)
                      .filter(Boolean)
                  ),
                ]
                  .sort((a, b) => a.localeCompare(b))
                  .map((sectorItem) => (
                    <option
                      key={sectorItem}
                      value={sectorItem}
                    >
                      {sectorItem}
                    </option>
                  ))}
              </select>
            </label>

            <label className="ue_label">
              <span className="ue_span">Subsector *</span>

              <select
                className="ue_input"
                name="subSector"
                value={empresaForm.subSector}
                onChange={handleEmpresaInput}
                disabled={!empresaForm.sector}
                required
              >
                <option value="">
                  {empresaForm.sector
                    ? "Seleccione un subsector"
                    : "Primero seleccione un sector"}
                </option>

                {[
                  ...new Set(
                    empresaSubsector
                      .map(
                        (item) =>
                          item.subsector ??
                          item.subSector
                      )
                      .filter(Boolean)
                      .map((value) =>
                        String(value).trim()
                      )
                  ),
                ]
                  .sort((a, b) => a.localeCompare(b))
                  .map((subsectorItem) => (
                    <option
                      key={subsectorItem}
                      value={subsectorItem}
                    >
                      {subsectorItem}
                    </option>
                  ))}
              </select>
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Especialidad
              </span>

              <input
                className="ue_input"
                type="text"
                name="especialidad"
                value={empresaForm.especialidad}
                onChange={handleEmpresaInput}
                placeholder="Actividad específica"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">Provincia</span>

              <select
                className="ue_input"
                name="provincia"
                value={empresaForm.provincia}
                onChange={handleEmpresaProvinciaChange}
              >
                <option value="">Seleccione una provincia</option>

                {[
                  ...new Set(
                    senpladesVal
                      .map((item) => item.provincia)
                      .filter(Boolean)
                  ),
                ]
                  .sort((a, b) => a.localeCompare(b))
                  .map((provincia) => (
                    <option
                      key={provincia}
                      value={provincia}
                    >
                      {provincia}
                    </option>
                  ))}
              </select>
            </label>

            <label className="ue_label">
              <span className="ue_span">Ciudad</span>

              <select
                className="ue_input"
                name="ciudad"
                value={empresaForm.ciudad}
                onChange={handleEmpresaInput}
                disabled={!empresaForm.provincia}
              >
                <option value="">
                  {empresaForm.provincia
                    ? "Seleccione una ciudad"
                    : "Primero seleccione una provincia"}
                </option>

                {[
                  ...new Set(
                    empresaCantones
                      .map((item) => item.canton)
                      .filter(Boolean)
                  ),
                ]
                  .sort((a, b) => a.localeCompare(b))
                  .map((canton) => (
                    <option
                      key={canton}
                      value={canton}
                    >
                      {canton}
                    </option>
                  ))}
              </select>
            </label>

            <label className="ue_label">
              <span className="ue_span">Gerente</span>

              <input
                className="ue_input"
                type="text"
                name="gerente"
                value={empresaForm.gerente}
                onChange={handleEmpresaInput}
                placeholder="Nombres del gerente"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Contacto del gerente
              </span>

              <input
                className="ue_input"
                type="text"
                name="contactoGerente"
                value={empresaForm.contactoGerente}
                onChange={handleEmpresaInput}
                placeholder="Número de contacto"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Correo del gerente
              </span>

              <input
                className="ue_input"
                type="email"
                name="correoGerente"
                value={empresaForm.correoGerente}
                onChange={handleEmpresaInput}
                placeholder="gerencia@correo.com"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                Sitio web
              </span>

              <input
                className="ue_input"
                type="text"
                name="sitioWeb"
                value={empresaForm.sitioWeb}
                onChange={handleEmpresaInput}
                placeholder="https://empresa.com"
              />
            </label>

            <label className="ue_label">
              <span className="ue_span">
                URL del logotipo
              </span>

              <input
                className="ue_input"
                type="text"
                name="logoUrl"
                value={empresaForm.logoUrl}
                onChange={handleEmpresaInput}
                placeholder="/uploads/empresas/logo.png"
              />
            </label>

            <label className="ue_label ue_companyFull">
              <span className="ue_span">
                Dirección
              </span>

              <textarea
                className="ue_input ue_textarea"
                name="direccion"
                value={empresaForm.direccion}
                onChange={handleEmpresaInput}
                placeholder="Dirección completa"
                rows="3"
              />
            </label>

            <label className="ue_switchLabel ue_companyFull">
              <input
                type="checkbox"
                name="activo"
                checked={empresaForm.activo}
                onChange={handleEmpresaInput}
              />

              <span className="ue_switch" />

              <span>
                Empresa activa y disponible para asociar
                usuarios
              </span>
            </label>
          </div>



          <section className="ue_companySections">
            <div className="ue_companySectionsHeader">
              <div>
                <h3>Secciones de la empresa</h3>

                <p>
                  Registre las áreas, departamentos o secciones
                  pertenecientes a esta empresa.
                </p>
              </div>

              <span className="ue_companySectionsCounter">
                {empresaSeccionesList.length}
              </span>
            </div>

            {!empresaEditingId ? (
              <div className="ue_companySectionsPending">
                <span>ℹ️</span>

                <p>
                  Primero registre la empresa. Después podrá agregar
                  sus secciones.
                </p>
              </div>
            ) : (
              <>
                <div className="ue_companySectionCreate">
                  <label className="ue_label">
                    <span className="ue_span">
                      Nombre de la sección
                    </span>

                    <input
                      className="ue_input"
                      type="text"
                      value={empresaSeccionNombre}
                      onChange={(event) =>
                        setEmpresaSeccionNombre(
                          event.target.value
                        )
                      }
                      placeholder="Ej. Talento Humano"
                      maxLength={150}
                    />
                  </label>

                  <button
                    type="button"
                    className="ue_btnPrimary"
                    onClick={guardarEmpresaSeccion}
                    disabled={isLoadingEmpresaSecciones}
                  >
                    {empresaSeccionEditingId
                      ? "Guardar sección"
                      : "Agregar sección"}
                  </button>

                  {empresaSeccionEditingId && (
                    <button
                      type="button"
                      className="ue_btnLight"
                      onClick={cancelarEdicionEmpresaSeccion}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>

                {empresaSeccionesList.length === 0 ? (
                  <div className="ue_companySectionsEmpty">
                    Esta empresa todavía no tiene secciones registradas.
                  </div>
                ) : (
                  <div className="ue_companySectionsList">
                    {empresaSeccionesList.map((seccion) => (
                      <article
                        className="ue_companySectionItem"
                        key={seccion.id}
                      >
                        <div>
                          <span className="ue_companySectionIcon">
                            🏷️
                          </span>

                          <strong>{seccion.nombre}</strong>
                        </div>

                        <div className="ue_companySectionActions">
                          <button
                            type="button"
                            className="ue_btnEditCompany"
                            onClick={() =>
                              editarEmpresaSeccion(seccion)
                            }
                          >
                            ✏ Editar
                          </button>

                          <button
                            type="button"
                            className="ue_btnDeleteCompany"
                            onClick={() =>
                              eliminarEmpresaSeccion(seccion)
                            }
                          >
                            🗑 Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>





          <div className="ue_companyFormActions">
            <button
              type="submit"
              className="ue_btnPrimaryFull"
            >
              {empresaEditingId
                ? "Guardar cambios"
                : "Registrar empresa"}

              <span className="ue_btnArrow">
                {empresaEditingId ? "✓" : "➜"}
              </span>
            </button>

            <button
              type="button"
              className="ue_btnLight"
              onClick={limpiarEmpresaForm}
            >
              Limpiar formulario
            </button>

            <button
              type="button"
              className="ue_btnSecondary"
              onClick={cerrarEmpresaForm}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* TABLA DE EMPRESAS */}

      {empresasFiltradas.length === 0 ? (
        <div className="ue_empty ue_emptyCompany">
          <span className="ue_emptyIcon">🏢</span>

          <h3>No se encontraron empresas</h3>

          <p>
            Registra una nueva empresa o cambia el término de
            búsqueda.
          </p>
        </div>
      ) : (
        <div className="ue_companyTableWrap">
          <table className="ue_companyTable">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>RUC</th>
                <th>Sector</th>
                <th>Subsector</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Empleados</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {empresasFiltradas.map((empresa) => (
                <tr
                  key={empresa.id}
                  className={
                    empresa.activo
                      ? ""
                      : "ue_companyRowInactive"
                  }
                >
                  <td>
                    <div className="ue_tableCompany">
                      <div className="ue_tableCompanyLogo">
                        {empresa.logoUrl ? (
                          <img
                            src={empresa.logoUrl}
                            alt={
                              empresa.nombreComercial ||
                              empresa.razonSocial
                            }
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span>
                            {String(
                              empresa.nombreComercial ||
                              empresa.razonSocial ||
                              "E"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <strong>
                          {empresa.nombreComercial ||
                            empresa.razonSocial}
                        </strong>

                        {empresa.nombreComercial && (
                          <small>
                            {empresa.razonSocial}
                          </small>
                        )}

                        <small>
                          {empresa.correo ||
                            "Sin correo registrado"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    {empresa.ruc || "No registrado"}
                  </td>

                  <td>
                    {empresa.sector || "No registrado"}
                  </td>

                  <td>
                    {empresa.subSector || "No registrado"}
                  </td>

                  <td>
                    {[
                      empresa.ciudad,
                      empresa.provincia,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No registrada"}
                  </td>

                  <td>
                    <div className="ue_tableContact">
                      <span>
                        {empresa.telefono ||
                          "Sin teléfono"}
                      </span>

                      <small>
                        {empresa.gerente ||
                          "Sin gerente"}
                      </small>
                    </div>
                  </td>

                  <td>
                    {empresa.numeroEmpleados || 0}
                  </td>

                  <td>
                    <span
                      className={`ue_statusBadge ${empresa.activo
                        ? "active"
                        : "inactive"
                        }`}
                    >
                      {empresa.activo
                        ? "Activa"
                        : "Inactiva"}
                    </span>
                  </td>

                  <td>
                    <div className="ue_tableActions">
                      <button
                        type="button"
                        className="ue_btnEditCompany"
                        title="Editar empresa"
                        onClick={() =>
                          editarEmpresa(empresa)
                        }
                      >
                        ✏ Editar
                      </button>

                      <button
                        type="button"
                        className="ue_btnDeleteCompany"
                        title="Eliminar empresa"
                        onClick={() =>
                          confirmarEliminarEmpresa(empresa)
                        }
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  /* ========================================
     COMPONENTE
  ======================================== */

  return (
    <div className="ue_page">
      {(isLoadingUsers ||
        isLoadingAuth ||
        isLoadingEmpresas) && <IsLoading />}

      <div className="ue_shell">
        <button
          ref={hamburgerRef}
          type="button"
          className={`ue_hamburger ${menuOpen ? "is-open" : ""
            }`}
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`ue_overlay ${menuOpen ? "open" : ""
            }`}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          ref={menuRef}
          className={`ue_menu ${menuOpen ? "open" : ""
            }`}
        >
          <div className="ue_menuHeader">
            <img
              src="/images/idrmind_sf.png"
              alt="iDr. Mind"
              className="ue_menuLogo"
            />

            <p>Panel administrativo</p>
          </div>

          <div className="ue_menuGroup">
            <span className="ue_menuGroupTitle">
              Administración
            </span>

            <button
              type="button"
              className={`ue_menuBtn ${activeSection === "usuarios"
                ? "active"
                : ""
                }`}
              onClick={() =>
                handleSelectSection("usuarios")
              }
            >
              <span className="ue_menuIcon">👤</span>

              <span>
                <strong>Usuarios</strong>
                <small>
                  Consultar, editar y eliminar
                </small>
              </span>
            </button>

            <button
              type="button"
              className={`ue_menuBtn ${activeSection === "empresas"
                ? "active"
                : ""
                }`}
              onClick={() =>
                handleSelectSection("empresas")
              }
            >
              <span className="ue_menuIcon">🏢</span>

              <span>
                <strong>Empresas</strong>
                <small>
                  Crear y administrar empresas
                </small>
              </span>
            </button>
          </div>

          <div className="ue_menuSummary">
            <div>
              <span>Usuarios cargados</span>
              <strong>{usersList.length}</strong>
            </div>

            <div>
              <span>Empresas</span>
              <strong>{empresasList.length}</strong>
            </div>
          </div>
        </aside>

        <main className="ue_content">
          {activeSection === "usuarios" &&
            renderUsuarios()}

          {activeSection === "empresas" &&
            renderEmpresas()}
        </main>
      </div>

      {/* MODAL ELIMINAR USUARIO */}

      {showDeleteUser && (
        <div className="ue_modalOverlay">
          <article className="ue_modal">
            <div className="ue_modalIcon danger">
              🗑
            </div>

            <h3>Eliminar usuario</h3>

            <p>
              ¿Estás seguro de que deseas eliminar este
              usuario? Esta acción no se puede deshacer.
            </p>

            <div className="ue_modalActions">
              <button
                className="ue_btnDanger"
                type="button"
                onClick={deleteUser}
              >
                Sí, eliminar
              </button>

              <button
                className="ue_btnLight"
                type="button"
                onClick={() => {
                  setShowDeleteUser(false);
                  setUserIdDelete(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </article>
        </div>
      )}

      {/* MODAL ELIMINAR EMPRESA */}

      {showDeleteEmpresa && (
        <div className="ue_modalOverlay">
          <article className="ue_modal">
            <div className="ue_modalIcon danger">
              🏢
            </div>

            <h3>Eliminar empresa</h3>

            <p>
              ¿Deseas eliminar la empresa{" "}
              <strong>
                {empresaDelete?.nombreComercial ||
                  empresaDelete?.razonSocial}
              </strong>
              ?
            </p>

            <p className="ue_modalWarning">
              Los usuarios asociados deberán quedar con
              empresa nula mediante la relación{" "}
              <code>ON DELETE SET NULL</code>.
            </p>

            <div className="ue_modalActions">
              <button
                className="ue_btnDanger"
                type="button"
                onClick={eliminarEmpresa}
              >
                Sí, eliminar
              </button>

              <button
                className="ue_btnLight"
                type="button"
                onClick={() => {
                  setShowDeleteEmpresa(false);
                  setEmpresaDelete(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

export default UserEdit;