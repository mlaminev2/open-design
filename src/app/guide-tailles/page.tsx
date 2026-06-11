import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Guide des tailles' }

export default function GuideTaillesPage() {
  return (
    <div className="content-page">
      <p className="section-label">Bien choisir sa taille</p>
      <h1>Guide des tailles</h1>
      <p>Toutes les mesures sont en centimètres. En cas de doute entre deux tailles, choisissez la plus grande.</p>

      <h2>Hauts & Manteaux</h2>
      <table className="size-table">
        <thead>
          <tr>
            <th>Taille</th><th>Tour de poitrine</th><th>Tour de taille</th><th>Tour de hanches</th><th>Longueur d'épaule</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['XS', '84–88', '68–72', '92–96', '41'],
            ['S', '88–92', '72–76', '96–100', '43'],
            ['M', '92–96', '76–80', '100–104', '44'],
            ['L', '96–102', '80–86', '104–110', '46'],
            ['XL', '102–108', '86–92', '110–116', '48'],
          ].map(([size, ...vals]) => (
            <tr key={size}>
              <td><strong>{size}</strong></td>
              {vals.map((v, i) => <td key={i}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Bas</h2>
      <table className="size-table">
        <thead>
          <tr>
            <th>Taille</th><th>Tour de taille</th><th>Tour de hanches</th><th>Entrejambe</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['36', '68–70', '94–96', '76'],
            ['38', '72–74', '98–100', '77'],
            ['40', '76–78', '102–104', '78'],
            ['42', '80–82', '106–108', '78'],
            ['44', '84–86', '110–112', '79'],
            ['46', '88–92', '114–118', '80'],
          ].map(([size, ...vals]) => (
            <tr key={size}>
              <td><strong>{size}</strong></td>
              {vals.map((v, i) => <td key={i}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Comment prendre ses mesures</h2>
      <ul>
        <li><strong>Tour de poitrine</strong> : ruban sous les aisselles, au niveau le plus fort de la poitrine.</li>
        <li><strong>Tour de taille</strong> : à la taille naturelle, la partie la plus étroite du buste.</li>
        <li><strong>Tour de hanches</strong> : au niveau le plus fort des hanches.</li>
        <li><strong>Entrejambe</strong> : du haut de l'entrejambe jusqu'à la cheville.</li>
      </ul>
    </div>
  )
}
