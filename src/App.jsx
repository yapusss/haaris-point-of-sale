import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";
export default function App() {
  const kategoriList = [
    "Elektronik",
    "Pakaian",
    "Makanan",
    "Minuman",
    "Rumah Tangga",
    "Kecantikan",
  ];
  const today = new Date().toISOString().slice(0, 10);
  const initialProducts = useMemo(
    () =>
      JSON.parse(localStorage.getItem("products")) || [
        {
          id: 1,
          nama: "Laptop",
          deskripsi: "Laptop Gaming",
          harga: 1050000,
          kategori: "Elektronik",
          tanggalRilis: today,
          stok: 10,
          aktif: true,
        },
        {
          id: 2,
          nama: "Kaos Polos",
          deskripsi: "Kaos tipis gerah",
          harga: 55000,
          kategori: "Pakaian",
          tanggalRilis: today,
          stok: 100,
          aktif: true,
        },
      ],
    []
  );
  const [products, setProducts] = useState(initialProducts);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggalRilis, setTanggalRilis] = useState("");
  const [stok, setStok] = useState(0);
  const [aktif, setAktif] = useState(true);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const validate = () => {
    const newErrors = {};
    const trimmedNama = nama.trim();
    if (!trimmedNama) newErrors.nama = "Nama produk wajib diisi";
    else if (trimmedNama.length > 100) newErrors.nama = "Maks. 100 karakter";

    if (!deskripsi || deskripsi.trim().length < 20)
      newErrors.deskripsi = "Deskripsi minimal 20 karakter";

    if (!harga) newErrors.harga = "Harga wajib diisi";
    else if (isNaN(harga) || Number(harga) < 1)
      newErrors.harga = "Harga minimal 1";

    if (!kategori) newErrors.kategori = "Kategori wajib dipilih";

    if (!tanggalRilis) newErrors.tanggalRilis = "Tanggal rilis wajib diisi";
    else if (tanggalRilis > today)
      newErrors.tanggalRilis = "Tidak boleh di masa depan";

    if (stok === "" || stok === null) newErrors.stok = "Stok wajib diisi";
    else if (isNaN(stok) || Number(stok) < 0) newErrors.stok = "Stok minimal 0";
    else if (Number(stok) > 9999) newErrors.stok = "Maksimal 9999";

    const duplicate = products.some(
      (p) =>
        p.nama.toLowerCase() === trimmedNama.toLowerCase() && p.id !== editingId
    );

    if (duplicate) newErrors.nama = "Nama produk sudah ada";

    return newErrors;
  };

  const resetForm = () => {
    setNama("");
    setDeskripsi("");
    setHarga("");
    setKategori("");
    setTanggalRilis("");
    setStok(0);
    setAktif(true);
    setErrors({});
    setEditingId(null);
  };

  const showToastMsg = (msg, variant = "success") => {
    setToastMessage(msg);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      showToastMsg("Periksa kembali input anda", "danger");
      return;
    }
    if (editingId === null) {
      const newProduct = {
        id: Date.now(),
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        harga: Number(harga),
        kategori,
        tanggalRilis,
        stok: Number(stok),
        aktif,
      };
      setProducts((prev) => [newProduct, ...prev]);
      resetForm();
      showToastMsg("Produk berhasil ditambahkan", "success");
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                nama: nama.trim(),
                deskripsi: deskripsi.trim(),
                harga: Number(harga),
                kategori,
                tanggalRilis,
                stok: Number(stok),
                aktif,
              }
            : p
        )
      );
      resetForm();
      showToastMsg("Produk berhasil diperbarui", "success");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setNama(product.nama);
    setDeskripsi(product.deskripsi);
    setHarga(product.harga);
    setKategori(product.kategori);
    setTanggalRilis(product.tanggalRilis);
    setStok(product.stok);
    setAktif(product.aktif);
    setErrors({});
  };

  const handleDelete = (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const ok = window.confirm(`Hapus produk "${target.nama}"?`);
    if (!ok) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
    showToastMsg("Produk berhasil dihapus", "success");
  };

  const isEditing = editingId !== null;
  return (
    <Container className="py-4">
      <Row>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">
              {isEditing ? "Edit Produk" : "Tambah Produk"}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="nama">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    value={nama}
                    placeholder="Contoh: Laptop Lenovo Z40"
                    onChange={(e) => {
                      setNama(e.target.value);
                      if (errors.nama)
                        setErrors((prev) => ({ ...prev, nama: undefined }));
                    }}
                    isInvalid={!!errors.nama}
                    maxLength={100}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nama}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="deskripsi">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    minLength={20}
                    value={deskripsi}
                    placeholder="Minimal 20 karakter"
                    onChange={(e) => {
                      setDeskripsi(e.target.value);
                      if (errors.deskripsi)
                        setErrors((prev) => ({
                          ...prev,
                          deskripsi: undefined,
                        }));
                    }}
                    isInvalid={!!errors.deskripsi}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.deskripsi}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="harga">
                  <Form.Label>Harga</Form.Label>
                  <Form.Control
                    type="number"
                    value={harga}
                    min={1}
                    step={1}
                    placeholder="Harga (Rp)"
                    onChange={(e) => {
                      setHarga(e.target.value);
                      if (errors.harga)
                        setErrors((prev) => ({ ...prev, harga: undefined }));
                    }}
                    isInvalid={!!errors.harga}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.harga}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="kategori">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select
                    value={kategori}
                    onChange={(e) => {
                      setKategori(e.target.value);
                      if (errors.kategori)
                        setErrors((prev) => ({ ...prev, kategori: undefined }));
                    }}
                    isInvalid={!!errors.kategori}
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.kategori}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="tanggalRilis">
                  <Form.Label>Tanggal Rilis</Form.Label>
                  <Form.Control
                    type="date"
                    value={tanggalRilis}
                    max={today}
                    onChange={(e) => {
                      setTanggalRilis(e.target.value);
                      if (errors.tanggalRilis)
                        setErrors((prev) => ({
                          ...prev,
                          tanggalRilis: undefined,
                        }));
                    }}
                    isInvalid={!!errors.tanggalRilis}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tanggalRilis}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="stok">
                  <Form.Label>Stok Tersedia</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={9999}
                    value={stok}
                    onChange={(e) => {
                      setStok(e.target.value);
                      if (errors.stok)
                        setErrors((prev) => ({ ...prev, stok: undefined }));
                    }}
                    isInvalid={!!errors.stok}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.stok}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="aktif">
                  <Form.Check
                    type="switch"
                    label="Produk Aktif"
                    checked={!!aktif}
                    onChange={(e) => setAktif(e.target.checked)}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant={isEditing ? "primary" : "success"}
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Tgl Rilis</th>
                    <th>Stok</th>
                    <th>Aktif</th>
                    <th style={{ width: 180 }} className="text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">
                        Belum ada data Produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product.nama}</td>
                        <td>{product.deskripsi}</td>
                        <td>{product.harga.toLocaleString("id-ID")}</td>
                        <td>{product.kategori}</td>
                        <td>{product.tanggalRilis}</td>
                        <td>{product.stok}</td>
                        <td>{product.aktif ? "Ya" : "Tidak"}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(product.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === "danger" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
