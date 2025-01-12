import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import WalletService, { WalletState } from '@/services/wallet'
import DealerService from '@/services/dealer'

interface Ticket {
  id: number
  owner: string | null
}

const TICKET_PRICE = 0.001 // SOL

const Lottery = forwardRef((props, ref) => {
  const [tickets, setTickets] = useState<Ticket[]>(
    Array.from({ length: 50 }, (_, i) => ({ id: i + 1, owner: null }))
  )
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    balance: 0,
    address: ''
  })

  const walletService = WalletService.getInstance()
  const dealerService = DealerService.getInstance()

  useEffect(() => {
    // Actualizar estado de la wallet
    setWalletState(walletService.getState())
  }, [])

  // Verificar si todos los tickets están vendidos
  useEffect(() => {
    const allSold = tickets.every(t => t.owner !== null)
    if (allSold && !isSpinning && !winner) {
      dealerService.announceAllTicketsSold()
    }
  }, [tickets, isSpinning, winner])

  const handleConnect = async () => {
    const state = await walletService.connect()
    setWalletState(state)
  }

  const handleDisconnect = async () => {
    await walletService.disconnect()
    setWalletState(walletService.getState())
  }

  const handleBuyTicket = async (ticketId: number) => {
    if (!walletState.connected) {
      alert('¡Conecta tu wallet primero!')
      return
    }

    const success = await walletService.buyTicket(TICKET_PRICE)
    if (success) {
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, owner: walletState.address }
            : ticket
        )
      )
      setWalletState(walletService.getState())
    } else {
      alert('No tienes suficiente SOL para comprar el ticket')
    }
  }

  const startLottery = () => {
    if (tickets.filter(t => t.owner !== null).length < 50) {
      alert('¡Necesitamos vender todos los tickets primero!')
      return
    }

    setIsSpinning(true)
    // Simular el sorteo
    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 50) + 1
      setWinner(winningNumber)
      setIsSpinning(false)
      dealerService.announceWinner(winningNumber)
    }, 3000)
  }

  // Exponer métodos a través de la referencia
  useImperativeHandle(ref, () => ({
    handleConnect,
    handleDisconnect,
    handleBuyTicket,
    startLottery
  }))

  return (
    <div className="fixed top-4 left-4 w-80 bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lotería PumpFun</h2>
        {!walletState.connected ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Conectar Wallet
          </button>
        ) : (
          <div className="text-right">
            <p className="text-sm text-gray-600">Balance: {walletState.balance.toFixed(3)} SOL</p>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Precio por ticket: {TICKET_PRICE} SOL
        </p>
        <div className="grid grid-cols-5 gap-2">
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => handleBuyTicket(ticket.id)}
              disabled={ticket.owner !== null || isSpinning || !walletState.connected}
              className={`
                w-12 h-12 rounded-lg text-sm font-bold
                ${
                  ticket.owner
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }
                ${isSpinning ? 'animate-pulse' : ''}
                ${winner === ticket.id ? 'ring-4 ring-yellow-400' : ''}
                ${!walletState.connected ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {ticket.id}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startLottery}
        disabled={isSpinning || tickets.some(t => t.owner === null)}
        className={`
          w-full py-2 rounded-lg font-bold
          ${
            isSpinning || tickets.some(t => t.owner === null)
              ? 'bg-gray-400'
              : 'bg-purple-600 hover:bg-purple-700'
          }
          text-white
        `}
      >
        {isSpinning ? 'Sorteando...' : '¡Iniciar Sorteo!'}
      </button>

      {winner && (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <p className="text-center font-bold">
            ¡El ticket ganador es el #{winner}!
          </p>
          <p className="text-center text-sm text-gray-600 mt-2">
            Ganador: {tickets[winner - 1]?.owner}
          </p>
        </div>
      )}
    </div>
  )
})

Lottery.displayName = 'Lottery'

export default Lottery 